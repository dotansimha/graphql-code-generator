import {
  DeclarationBlock,
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
  InterfaceTypeDefinitionNode,
  NamedTypeNode,
  GraphQLSchema,
  isEnumType,
  UnionTypeDefinitionNode,
  GraphQLNamedType,
} from 'graphql';
import { TypeScriptPluginConfig } from './config';
import { ASTReducer } from 'graphql/language/visitor';

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
): DeclarationBlock {
  const optionalTypename = config.nonOptionalTypename ? '__typename' : '__typename?';
  const allFields = [
    ...(config.skipTypename
      ? []
      : [indent(`${config.immutableTypes ? 'readonly ' : ''}${optionalTypename}: '${node.name}';`)]),
    ...(node.fields || []),
  ] as string[];
  const interfacesNames = originalNode.interfaces ? originalNode.interfaces.map(i => convertName(i)) : [];

  const declarationBlock = new DeclarationBlock({
    enumNameValueSeparator: ' =',
    ignoreExport: config.noExport,
  })
    .export()
    .asKind('type')
    .withName(convertName(node))
    .withComment(node.description as any as string);

  appendInterfacesAndFieldsToBlock(declarationBlock, interfacesNames, allFields);

  return declarationBlock;
}

function buildArgumentsBlock(node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode, config: any) {
  const fieldsWithArguments = node.fields?.filter(field => field.arguments && field.arguments.length > 0) || [];
  return fieldsWithArguments
    .map(field => {
      const name =
        node.name.value +
        (config.addUnderscoreToArgsType ? '_' : '') +
        convertName(field, {
          useTypesPrefix: false,
          useTypesSuffix: false,
        }) +
        'Args';

      if (config.onlyEnums) return '';

      return new DeclarationBlock({
        enumNameValueSeparator: ' =',
        ignoreExport: config.noExport,
      })
        .export()
        .asKind('type')
        .withName(convertName(name))
        .withComment(node.description || null).string;
    })
    .join('\n');
}

function appendInterfacesAndFieldsToBlock(block: DeclarationBlock, interfaces: string[], fields: string[]): void {
  block.withContent(mergeInterfaces(interfaces, fields.length > 0));
  block.withBlock(fields.join('\n'));
}

function mergeInterfaces(interfaces: string[], hasOtherFields: boolean): string {
  return interfaces.join(' & ') + (interfaces.length && hasOtherFields ? ' & ' : '');
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
      const directiveName = directive.name as any as string;
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
  if ((directive.name as any) === 'deprecated') {
    const hasArguments = !!directive.arguments?.length;
    let reason = 'Field no longer supported';
    if (hasArguments) {
      reason = directive.arguments[0].value.kind;
    }
    return reason;
  }
}

export function getNodeComment(node: FieldDefinitionNode | EnumValueDefinitionNode | InputValueDefinitionNode): string {
  let commentText: string = node.description as any;
  const deprecationDirective = node.directives?.find(v => v.name.value === 'deprecated');
  if (deprecationDirective) {
    const deprecationReason = getDeprecationReason(deprecationDirective);
    commentText = `${commentText ? `${commentText}\n` : ''}@deprecated ${deprecationReason}`;
  }
  const comment = transformComment(commentText, 1);
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
    InputValueDefinition: {
      leave(node, key, parent, _path, ancestors) {
        const originalFieldNode = parent[key] as FieldDefinitionNode;

        const avoidOptionalsConfig = typeof config.avoidOptionals === 'object' ? config.avoidOptionals : {};

        const addOptionalSign =
          !avoidOptionalsConfig.inputValue &&
          (originalFieldNode.type.kind !== Kind.NON_NULL_TYPE ||
            (!avoidOptionalsConfig.defaultValue && node.defaultValue !== undefined));
        const comment = getNodeComment(node as any as InputValueDefinitionNode);

        let type: string = node.type as any as string;
        if (node.directives && config.directiveArgumentAndInputFieldMappings) {
          type = _getDirectiveOverrideType(node.directives, config) || type;
        }

        const readonlyPrefix = config.immutableTypes ? 'readonly ' : '';

        const buildFieldDefinition = (isOneOf = false) => {
          return `${readonlyPrefix}${node.name}${addOptionalSign && !isOneOf ? '?' : ''}: ${
            isOneOf ? clearOptional(type) : type
          };`;
        };

        const realParentDef = ancestors?.[ancestors.length - 1];
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
              if (fieldName === (node.name as any as string)) {
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
        const originalNode = parent[key] as UnionTypeDefinitionNode;
        const possibleTypes = originalNode.types
          .map(t => (scalarsMap[t.name.value] ? `Scalars['${t.name.value}']` : convertName(t)))
          .concat(...withFutureAddedValue)
          .join(' | ');

        return new DeclarationBlock({
          enumNameValueSeparator: ' =',
          ignoreExport: config.noExport,
        })
          .export()
          .asKind('type')
          .withName(convertName(node))
          .withComment(node.description as any as string)
          .withContent(possibleTypes).string;
      },
    },
    InterfaceTypeDefinition: {
      leave(node, key, parent, _path, _ancestors) {
        if (config.onlyOperationTypes || config.onlyEnums) return '';
        const originalNode = parent[key];

        const declarationBlock = new DeclarationBlock({
          enumNameValueSeparator: ' =',
          ignoreExport: config.noExport,
        })
          .export()
          .asKind('interface')
          .withName(convertName(node))
          .withComment(node.description as any as string)
          .withBlock(node.fields.join('\n'));

        return [declarationBlock.string, buildArgumentsBlock(originalNode, config)].filter(f => f).join('\n\n');
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
        const originalNode = parent[key] as any;

        const name: string = node.name as any;

        if (typesToInclude && !typesToInclude.some(type => type.name === name)) {
          return null;
        }

        return [
          getObjectTypeDeclarationBlock(node, originalNode, config).string,
          buildArgumentsBlock(originalNode, config),
        ].join('');
      },
    },
    EnumTypeDefinition: {
      leave() {
        return '';
      },
    },
    InputObjectTypeDefinition: {
      leave(node, _key, _parent, _path, _ancestors) {
        if (config.onlyEnums) return '';

        // Why the heck is node.name a string and not { value: string } at runtime ?!
        if (isOneOfInputObjectType(_schema.getType(node.name as unknown as string))) {
          const declarationKind = 'type';
          return new DeclarationBlock({
            enumNameValueSeparator: ' =',
            ignoreExport: config.noExport,
          })
            .export()
            .asKind(declarationKind)
            .withName(convertName(node))
            .withComment(node.description as any as string)
            .withContent(`\n` + node.fields.join('\n  |')).string;
        }

        return new DeclarationBlock({
          enumNameValueSeparator: ' =',
          ignoreExport: config.noExport,
        })
          .export()
          .asKind('type')
          .withName(convertName(node))
          .withComment(node.description as any as string)
          .withBlock(node.fields.join('\n')).string;
      },
    },
    NamedType: {
      leave(node, _key, _parent, _path, ancestors) {
        const isVisitingInputType = getKindsFromAncestors(ancestors).includes(Kind.INPUT_OBJECT_TYPE_DEFINITION);

        let typeToUse = getTypeForNode(node as any as NamedTypeNode, config, _schema, scalarsMap);

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
        const typeString = config.wrapFieldDefinitions
          ? `EntireFieldWrapper<${node.type}>`
          : (node.type as any as string);
        // TODO
        const originalFieldNode = (parent as any)[key as number];
        const addOptionalSign =
          !(config.avoidOptionals as any)?.field && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
        const comment = getNodeComment(node as any as FieldDefinitionNode);

        return (
          comment +
          indent(`${config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${typeString};`)
        );
      },
    },
  };
}
