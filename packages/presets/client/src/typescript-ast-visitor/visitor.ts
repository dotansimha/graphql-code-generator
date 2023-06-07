import {
  ParsedScalarsMap,
  convertFactory,
  isOneOfInputObjectType,
  transformComment,
} from '@graphql-codegen/visitor-plugin-common';
import {
  ASTNode,
  DirectiveNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  Kind,
  ObjectTypeDefinitionNode,
  NamedTypeNode,
  GraphQLSchema,
  isEnumType,
  UnionTypeDefinitionNode,
  GraphQLNamedType,
} from 'graphql';
import { TypeScriptPluginConfig } from './config';
import { ASTReducer } from 'graphql/language/visitor';
import * as ts from 'typescript';
const tsf = ts.factory;

export function indent(str: string, count = 1): string {
  return new Array(count).fill('  ').join('') + str;
}

function MaybeString(ancestors: readonly (ASTNode | readonly ASTNode[])[], children: string) {
  const currentVisitContext = getKindsFromAncestors(ancestors);
  const isInputContext = currentVisitContext.includes(Kind.INPUT_OBJECT_TYPE_DEFINITION);

  return isInputContext ? `InputMaybe<${children}>` : `Maybe<${children}>`;
}

function convertName(
  node: ASTNode | string,
  options?: { useTypesPrefix?: boolean; useTypesSuffix?: boolean; typesPrefix?: string; typesSuffix?: string }
): string {
  const useTypesPrefix = typeof options?.useTypesPrefix === 'boolean' ? options.useTypesPrefix : true;
  const useTypesSuffix = typeof options?.useTypesSuffix === 'boolean' ? options.useTypesSuffix : true;

  let convertedName = '';

  if (useTypesPrefix && options?.typesPrefix) {
    convertedName += options?.typesPrefix;
  }

  const convert = convertFactory({ namingConvention: 'keep' });
  convertedName += convert(node, {
    prefix: options?.typesPrefix,
    suffix: options?.typesSuffix,
  });

  if (useTypesSuffix && options?.typesSuffix) {
    convertedName += options?.typesSuffix;
  }

  return convertedName;
}

function getObjectTypeDeclarationBlock(
  node: ObjectTypeDefinitionNode,
  originalNode: ObjectTypeDefinitionNode,
  config: TypeScriptPluginConfig
) {
  const allFields = (node.fields as any as string[]) || [];

  const interfacesNames = originalNode.interfaces ? originalNode.interfaces.map(i => convertName(i)) : [];

  const intersectionType = tsf.createIntersectionTypeNode([
    ...interfacesNames.map(i => tsf.createTypeReferenceNode(i, undefined)),
    tsf.createTypeLiteralNode([
      tsf.createPropertySignature(
        config.immutableTypes ? [tsf.createModifier(ts.SyntaxKind.ReadonlyKeyword)] : [],
        tsf.createIdentifier('__typename'),
        config.nonOptionalTypename ? undefined : tsf.createToken(ts.SyntaxKind.QuestionToken),
        tsf.createLiteralTypeNode(tsf.createStringLiteral(node.name as any as string))
      ),
      ...allFields.map(f => tsf.createPropertySignature(undefined, f.replace(';', ''), undefined, undefined)),
    ]),
  ]);

  const declarationBlock = typeNodeDeclaration({
    name: convertName(node),
    useExport: config.noExport ? false : true,
    comment: node.description?.value,
    type: intersectionType,
  });

  return printNode(declarationBlock);
}

function getTypeForNode(
  node: NamedTypeNode,
  config: TypeScriptPluginConfig,
  schema: GraphQLSchema,
  scalars: ParsedScalarsMap
): string {
  const typename = typeof node.name === 'string' ? node.name : node.name.value;

  if (scalars[typename]) {
    return `Scalars['${typename}']`;
  }
  const schemaType = schema.getType(typename);

  if (schemaType && isEnumType(schemaType)) {
    return convertName(node, { useTypesPrefix: config.enumPrefix, typesPrefix: config.typesPrefix });
  }

  return convertName(node);
}

function clearOptional(str: string): string {
  if (str.startsWith('Maybe')) {
    return str.replace(/Maybe<(.*?)>$/, '$1');
  }

  return str;
}

function _getDirectiveOverrideType(
  directives: ReadonlyArray<DirectiveNode>,
  config: TypeScriptPluginConfig
): string | null {
  const type = directives
    .map(directive => {
      const directiveName = directive.name.value;
      if (config.directiveArgumentAndInputFieldMappings?.[directiveName]) {
        return `DirectiveArgumentAndInputFieldMappings['${directiveName}']`;
      }
      return null;
    })
    .reverse()
    .find(a => !!a);

  return type || null;
}

export function getDeprecationReason(directive: DirectiveNode): string | void {
  if (directive.name.value === 'deprecated') {
    const hasArguments = !!directive.arguments?.length;
    let reason = 'Field no longer supported';
    if (hasArguments) {
      reason = directive.arguments[0].value.kind;
    }
    return reason;
  }
}

export function getNodeComment(node: FieldDefinitionNode | EnumValueDefinitionNode | InputValueDefinitionNode): string {
  let commentText = node.description?.value;
  const deprecationDirective = node.directives?.find(v => v.name.value === 'deprecated');
  if (deprecationDirective) {
    const deprecationReason = getDeprecationReason(deprecationDirective);
    commentText = `${commentText ? `${commentText}\n` : ''}@deprecated ${deprecationReason}`;
  }
  const comment = transformComment(commentText || '', 1);
  return comment;
}

export function getKindsFromAncestors(ancestors: readonly (ASTNode | readonly ASTNode[])[]) {
  if (!ancestors) return [];

  return ancestors
    .map(t => {
      return 'length' in t ? t.map(t => t.kind) : t.kind;
    })
    .filter(Boolean);
}

export function typeScriptASTVisitor(
  _schema: GraphQLSchema,
  scalarsMap: ParsedScalarsMap,
  config: TypeScriptPluginConfig,
  typesToInclude?: GraphQLNamedType[]
  // todo
): ASTReducer<any> {
  return {
    Document: {
      leave(node) {
        const sourceFile = ts.createSourceFile('filename.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);

        (node as any).__tempNewValue = sourceFile;
        return node;
      },
    },
    InputValueDefinition: {
      leave(node, key, parent, _path, ancestors) {
        const originalFieldNode = Array.isArray(parent) ? parent[Number(key)] : parent;

        const avoidOptionalsConfig = typeof config.avoidOptionals === 'object' ? config.avoidOptionals : {};

        const addOptionalSign =
          !avoidOptionalsConfig.inputValue &&
          (originalFieldNode.type.kind !== Kind.NON_NULL_TYPE ||
            (!avoidOptionalsConfig.defaultValue && node.defaultValue !== undefined));
        const comment = getNodeComment(node);

        let type: string = node.type;
        if (node.directives && config.directiveArgumentAndInputFieldMappings) {
          type = _getDirectiveOverrideType(node.directives, config) || type;
        }

        const readonlyPrefix = config.immutableTypes ? 'readonly ' : '';

        const buildFieldDefinition = (isOneOf = false) => {
          return `${readonlyPrefix}${node.name}${addOptionalSign && !isOneOf ? '?' : ''}: ${
            isOneOf ? clearOptional(type) : type
          };`;
        };

        const realParentDef = ancestors?.[ancestors.length - 1] as ObjectTypeDefinitionNode;
        if (realParentDef) {
          const parentType = _schema.getType(realParentDef.name.value);

          if (isOneOfInputObjectType(parentType)) {
            if (originalFieldNode.type.kind === Kind.NON_NULL_TYPE) {
              throw new Error(
                'Fields on an input object type can not be non-nullable. It seems like the schema was not validated.'
              );
            }
            const fieldParts: Array<string> = [];
            for (const fieldName of Object.keys(parentType.getFields())) {
              // Why the heck is node.name a string and not { value: string } at runtime ?!
              if (fieldName === node.name) {
                fieldParts.push(buildFieldDefinition(true));
                continue;
              }
              fieldParts.push(`${readonlyPrefix}${fieldName}?: never;`);
            }

            return comment + indent(`{ ${fieldParts.join(' ')} }`);
          }
        }

        return comment + indent(buildFieldDefinition());
      },
    },
    Name: {
      leave(node, _key, _parent, _path, _ancestors) {
        return node.value;
      },
    },
    UnionTypeDefinition: {
      leave(node, key, parent, _path, _ancestors) {
        if (config.onlyOperationTypes || config.onlyEnums) return '';

        let withFutureAddedValue: string[] = [];
        if (config.futureProofUnions) {
          withFutureAddedValue = [
            config.immutableTypes ? `{ readonly __typename?: "%other" }` : `{ __typename?: "%other" }`,
          ];
        }
        const originalNode: UnionTypeDefinitionNode = Array.isArray(parent) ? parent[Number(key)] : parent;
        const possibleTypes = originalNode.types
          ?.map(t => (scalarsMap[t.name.value] ? `Scalars['${t.name.value}']` : convertName(t)))
          .concat(...withFutureAddedValue)
          .join(' | ');

        // TODO: It seems we're missing a test
        const declarationBlock = typeNodeDeclaration({
          name: convertName(node),
          useExport: config.noExport ? false : true,
          comment: node.description?.value,
          type: tsf.createTypeLiteralNode(
            possibleTypes
              ?.split(' | ')
              .map(f => tsf.createPropertySignature(undefined, f.replace(';', ''), undefined, undefined))
          ),
        });

        return printNode(declarationBlock);
      },
    },
    InterfaceTypeDefinition: {
      leave(node, _key, _parent, _path, _ancestors) {
        if (config.onlyOperationTypes || config.onlyEnums) return '';

        const typeElementArray: ts.TypeElement[] =
          node.fields?.map(f => {
            return tsf.createPropertySignature(undefined, f.replace(';', ''), undefined, undefined);
          }) || [];

        const interfaceDeclarationBlock = interfaceNodeDeclaration({
          name: convertName(node),
          useExport: config.noExport ? false : true,
          comment: node.description?.value,
          type: typeElementArray,
        });

        return printNode(interfaceDeclarationBlock);
      },
    },
    ScalarTypeDefinition: {
      leave(_node, _key, _parent, _path, _ancestors) {
        return '';
      },
    },
    DirectiveDefinition: {
      leave(_node, _key, _parent, _path, _ancestors) {
        return '';
      },
    },
    SchemaDefinition: {
      leave(_node, _key, _parent, _path, _ancestors) {
        return '';
      },
    },
    ObjectTypeDefinition: {
      leave(node, key, parent, _path, _ancestors) {
        if (config.onlyOperationTypes || config.onlyEnums) return '';
        const originalNode = Array.isArray(parent) ? parent[Number(key)] : parent;
        const name = node.name;

        if (typesToInclude && !typesToInclude.some(type => type.name === name)) {
          return null;
        }

        return [getObjectTypeDeclarationBlock(node, originalNode, config)].join('');
      },
    },
    EnumTypeDefinition: {
      leave() {
        return null;
      },
    },
    InputObjectTypeDefinition: {
      leave(node, _key, _parent, _path, _ancestors) {
        if (config.onlyEnums) return '';

        // Why the heck is node.name a string and not { value: string } at runtime ?!
        const declarationBlock = typeNodeDeclaration({
          name: convertName(node),
          useExport: config.noExport ? false : true,
          comment: node.description?.value,
          type: tsf.createTypeLiteralNode(
            node.fields?.map(f => tsf.createPropertySignature(undefined, f.replace(';', ''), undefined, undefined))
          ),
        });

        return printNode(declarationBlock);
      },
    },
    NamedType: {
      leave(node, _key, _parent, _path, ancestors) {
        const isVisitingInputType = getKindsFromAncestors(ancestors).includes(Kind.INPUT_OBJECT_TYPE_DEFINITION);

        let typeToUse = getTypeForNode(node, config, _schema, scalarsMap);

        if (!isVisitingInputType && config.fieldWrapperValue && config.wrapFieldDefinitions) {
          typeToUse = `FieldWrapper<${typeToUse}>`;
        }

        return MaybeString(ancestors, typeToUse);
      },
    },
    ListType: {
      leave(node, _key, _parent, _path, ancestors) {
        return MaybeString(ancestors, `Array<${node.type}>`);
      },
    },
    NonNullType: {
      leave(node, _key, _parent, _path, _ancestors) {
        if (node.type.startsWith('Maybe')) {
          return node.type.replace(/Maybe<(.*?)>$/, '$1');
        }
        if (node.type.startsWith('InputMaybe')) {
          return node.type.replace(/InputMaybe<(.*?)>$/, '$1');
        }

        return node.type;
      },
    },
    FieldDefinition: {
      leave(node, key, parent, _path, _ancestors) {
        const typeString = config.wrapFieldDefinitions ? `EntireFieldWrapper<${node.type}>` : node.type;
        const originalFieldNode = Array.isArray(parent) ? parent[Number(key)] : parent;

        const avoidOptionalsConfig = typeof config.avoidOptionals === 'object' ? config.avoidOptionals : {};
        const addOptionalSign = !avoidOptionalsConfig.field && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
        const comment = getNodeComment(node);

        return (
          comment +
          indent(`${config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${typeString};`)
        );
      },
    },
  };
}

export const typeNodeDeclaration = ({
  name,
  type,
  comment,
  useExport,
}: {
  name: string;
  type: ts.TypeNode;
  comment?: string | undefined;
  useExport: boolean;
}) => {
  const typeAliasDeclaration = tsf.createTypeAliasDeclaration(
    useExport ? [tsf.createModifier(ts.SyntaxKind.ExportKeyword)] : [],
    name,
    undefined,
    type
  );

  if (comment) {
    ts.addSyntheticLeadingComment(typeAliasDeclaration, ts.SyntaxKind.MultiLineCommentTrivia, comment, true);
  }

  return typeAliasDeclaration;
};

export const interfaceNodeDeclaration = ({
  name,
  type,
  comment,
  useExport,
}: {
  name: string;
  type: ts.TypeElement[];
  comment?: string | undefined;
  useExport: boolean;
}) => {
  const interfaceDeclaration = tsf.createInterfaceDeclaration(
    useExport ? [tsf.createModifier(ts.SyntaxKind.ExportKeyword)] : [],
    tsf.createIdentifier(name),
    undefined,
    undefined,
    type
  );

  if (comment) {
    ts.addSyntheticLeadingComment(interfaceDeclaration, ts.SyntaxKind.MultiLineCommentTrivia, comment, true);
  }

  return interfaceDeclaration;
};

const printNode = (node: ts.Node | ts.Node[]) => {
  const sourceFile = ts.createSourceFile('graphql.ts', '', ts.ScriptTarget.ES2020, false, ts.ScriptKind.TSX);
  const printer = ts.createPrinter({
    omitTrailingSemicolon: false,
    newLine: ts.NewLineKind.CarriageReturnLineFeed,
  });
  if (Array.isArray(node)) {
    return printer.printList(ts.ListFormat.MultiLine, tsf.createNodeArray(node), sourceFile);
  }
  return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
};
