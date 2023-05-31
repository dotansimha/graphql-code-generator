import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';

import { TypeScriptPluginConfig } from './config';
import { TsVisitor } from './ts-visitor';
import { includeIntrospectionTypesDefinitions } from './graphql-visitor-utils';
import {
  addSyntheticLeadingComment,
  createPrinter,
  createSourceFile,
  EmitHint,
  factory,
  ImportDeclaration,
  ImportEqualsDeclaration,
  ListFormat,
  NewLineKind,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
} from 'typescript';
import {
  buildScalarsFromConfig,
  convertFactory,
  parseEnumValues,
  transformComment,
  transformDirectiveArgumentAndInputFieldMappings,
} from '@graphql-codegen/visitor-plugin-common';
import {
  ASTNode,
  DirectiveDefinitionNode,
  DirectiveNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  GraphQLSchema,
  InputValueDefinitionNode,
  isEnumType,
  Kind,
  NamedTypeNode,
  print,
  visit,
} from 'graphql';

export function indent(str: string, count = 1): string {
  return new Array(count).fill('  ').join('') + str;
}

function getDeprecationReason(directive: DirectiveNode): string | void {
  if ((directive.name as any) === 'deprecated') {
    const hasArguments = directive.arguments.length > 0;
    let reason = 'Field no longer supported';
    if (hasArguments) {
      reason = directive.arguments[0].value as any;
    }
    return reason;
  }
}

function getNodeComment(node: FieldDefinitionNode | EnumValueDefinitionNode | InputValueDefinitionNode): string {
  let commentText: string = node.description as any;
  const deprecationDirective = node.directives.find((v: any) => v.name === 'deprecated');
  if (deprecationDirective) {
    const deprecationReason = getDeprecationReason(deprecationDirective);
    commentText = `${commentText ? `${commentText}\n` : ''}@deprecated ${deprecationReason}`;
  }
  const comment = transformComment(commentText, 1);
  return comment;
}

function getKindsFromAncestors(ancestors: readonly (ASTNode | readonly ASTNode[])[]) {
  if (!ancestors) return [];

  return ancestors
    .map(t => {
      return 'length' in t ? t.map(t => t.kind) : t.kind;
    })
    .filter(Boolean);
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

  // todo?
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

function getTypeForNode(node: NamedTypeNode, config: TypeScriptPluginConfig, schema: GraphQLSchema, scalars): string {
  const typename = typeof node.name === 'string' ? node.name : node.name.value;

  // todo
  if (scalars[typename]) {
    return `Scalars['${typename}']`;
  }

  // const { enumValues } = config;
  // if (enumValues && enumValues[typename as keyof TypeScriptPluginConfig['enumValues']]) {
  //   return enumValues[typename as keyof TypeScriptPluginConfig['enumValues']]?.typeIdentifier;
  // }

  const schemaType = schema.getType(typename);

  if (schemaType && isEnumType(schemaType)) {
    return convertName(node, { useTypesPrefix: config.enumPrefix, typesPrefix: config.typesPrefix });
  }

  return convertName(node);
}

export const plugin: PluginFunction<TypeScriptPluginConfig, Types.ComplexPluginOutput> = (
  schema,
  documents,
  config
) => {
  const { schema: _schema, ast: gqlDocumentNode } = transformSchemaAST(schema, config);

  const sourceFile = createSourceFile('graphql.ts', '', ScriptTarget.ES2020, false, ScriptKind.TSX);
  const printer = createPrinter({ omitTrailingSemicolon: false, newLine: NewLineKind.CarriageReturnLineFeed });

  const scalarsMap = buildScalarsFromConfig(schema, config);

  const gqlTsLeaveVisitors = new TsVisitor(_schema, config, {}, sourceFile, printer);

  type VisitorResultTypeScriptAST = string; // <- TODO
  const visitorResult = visit<VisitorResultTypeScriptAST>(gqlDocumentNode, {
    // TODO: 1
    InputValueDefinition: {
      leave(node, _key, _parent, _path, _ancestors) {
        return gqlTsLeaveVisitors.InputValueDefinition(node as any);
      },
    },
    Name: {
      leave(node, _key, _parent, _path, _ancestors) {
        return node.value;
      },
    },
    // TODO: 2
    UnionTypeDefinition: {
      leave(node, _key, _parent, _path, _ancestors) {
        return gqlTsLeaveVisitors.UnionTypeDefinition(node as any, _key, _parent);
      },
    },
    // TODO: 3
    InterfaceTypeDefinition: {
      leave(node, _key, _parent, _path, _ancestors) {
        return gqlTsLeaveVisitors.InterfaceTypeDefinition(node as any, _key, _parent);
      },
    },
    // TODO: 4
    ScalarTypeDefinition: {
      leave(node, _key, _parent, _path, _ancestors) {
        return gqlTsLeaveVisitors.ScalarTypeDefinition(node as any);
      },
    },
    // TODO: 5
    EnumTypeDefinition: {
      leave(node, _key, _parent, _path, _ancestors) {
        return gqlTsLeaveVisitors.EnumTypeDefinition(node as any, _key, _parent);
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
    // TODO: 6
    ObjectTypeDefinition: {
      leave(node, key, parent, _path, _ancestors) {
        return gqlTsLeaveVisitors.ObjectTypeDefinition(node as any, key!, parent);
      },
    },
    // TODO: 7
    InputObjectTypeDefinition: {
      leave(node, _key, _parent, _path, _ancestors) {
        return gqlTsLeaveVisitors.InputObjectTypeDefinition(node as any);
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
  });
  const introspectionDefinitions = includeIntrospectionTypesDefinitions(_schema, documents, config);

  // Scalars
  const scalars_ = Object.keys(scalarsMap).map(scalarName => {
    const scalarValue = scalarsMap[scalarName].type;
    const scalarType = schema.getType(scalarName);
    const comment = scalarType?.astNode && scalarType.description ? transformComment(scalarType.description, 1) : '';

    const propertySignature = factory.createPropertySignature(
      undefined,
      scalarName,
      undefined,
      factory.createTypeReferenceNode(scalarValue)
    );

    if (comment) {
      addSyntheticLeadingComment(propertySignature, SyntaxKind.MultiLineCommentTrivia, comment, true);
    }

    return propertySignature;
  });

  const scalarsTypeAliasDeclaration = factory.createTypeAliasDeclaration(
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    'Scalars',
    undefined,
    factory.createTypeLiteralNode(scalars_)
  );

  addSyntheticLeadingComment(
    scalarsTypeAliasDeclaration,
    SyntaxKind.MultiLineCommentTrivia,
    // TODO: that's an ugly workaround
    '* All built-in and custom scalars, mapped to their actual values ',
    true
  );

  const scalarsTypeDeclaration = printer.printNode(EmitHint.Unspecified, scalarsTypeAliasDeclaration, sourceFile);

  const directiveEntries = Object.entries(config.directiveArgumentAndInputFieldMappings || {});
  const directives = directiveEntries.map(([directiveName, directiveValue]) => {
    const directiveType = schema.getDirective(directiveName);
    const comment =
      directiveType?.astNode && directiveType.description ? transformComment(directiveType.description, 1) : '';

    const propertySignature = factory.createPropertySignature(
      undefined,
      directiveName,
      undefined,
      factory.createTypeReferenceNode(directiveValue)
    );

    if (comment) {
      addSyntheticLeadingComment(propertySignature, SyntaxKind.MultiLineCommentTrivia, comment, true);
    }

    return propertySignature;
  });

  let directivesDeclaration = '';
  if (directives.length) {
    const directivestTypeAliasDeclaration = factory.createTypeAliasDeclaration(
      undefined,
      'DirectiveArgumentAndInputFieldMappings',
      undefined,
      factory.createTypeLiteralNode(directives)
    );

    addSyntheticLeadingComment(
      directivestTypeAliasDeclaration,
      SyntaxKind.SingleLineCommentTrivia,
      'Type overrides using directives',
      true
    );

    directivesDeclaration = printer.printNode(EmitHint.Unspecified, directivestTypeAliasDeclaration, sourceFile);
  }

  const parsedEnumValues = parseEnumValues({
    schema,
    mapOrStr: config.enumValues!,
    ignoreEnumValuesFromSchema: config.ignoreEnumValuesFromSchema,
  });

  const enumImportDeclarations = Object.keys(parsedEnumValues).flatMap(
    (enumName): Array<ImportDeclaration | ImportEqualsDeclaration> => {
      const mappedValue = parsedEnumValues[enumName];

      if (!mappedValue.sourceFile) {
        return [];
      }

      if (mappedValue.isDefault) {
        const importDeclaration = factory.createImportDeclaration(
          undefined,
          factory.createImportClause(
            config.useTypeImports ?? false,
            undefined,
            factory.createNamedImports([
              factory.createImportSpecifier(
                false,
                factory.createIdentifier('default'),
                factory.createIdentifier(mappedValue.typeIdentifier)
              ),
            ])
          ),
          factory.createStringLiteral(mappedValue.sourceFile)
        );

        return [importDeclaration];
      }

      if (mappedValue.importIdentifier !== mappedValue.sourceIdentifier) {
        // use namespace import to dereference nested enum
        // { enumValues: { MyEnum: './my-file#NS.NestedEnum' } }
        const importDeclaration = factory.createImportDeclaration(
          undefined,
          factory.createImportClause(
            config.useTypeImports ?? false,
            factory.createIdentifier(mappedValue.importIdentifier || mappedValue.sourceIdentifier || ''),
            undefined
          ),
          factory.createStringLiteral(mappedValue.sourceFile)
        );

        const importEqualsDeclaration = factory.createImportEqualsDeclaration(
          undefined,
          false,
          factory.createIdentifier(mappedValue.typeIdentifier),
          factory.createIdentifier(mappedValue.sourceIdentifier!)
        );

        return [importDeclaration, importEqualsDeclaration];
      }

      if (mappedValue.sourceIdentifier !== mappedValue.typeIdentifier) {
        return [
          factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
              config.useTypeImports ?? false,
              undefined,
              factory.createNamedImports([
                factory.createImportSpecifier(
                  false,
                  factory.createIdentifier(mappedValue.sourceIdentifier!),
                  factory.createIdentifier(mappedValue.typeIdentifier)
                ),
              ])
            ),
            factory.createStringLiteral(mappedValue.sourceFile)
          ),
        ];
      }

      return [
        factory.createImportDeclaration(
          undefined,
          factory.createImportClause(
            config.useTypeImports ?? false,
            factory.createIdentifier(mappedValue.importIdentifier || mappedValue.sourceIdentifier || ''),
            undefined
          ),
          factory.createStringLiteral(mappedValue.sourceFile)
        ),
      ];
    }
  );

  const importDeclarationsAsNode = factory.createNodeArray(enumImportDeclarations.filter(Boolean));
  const enumImportsDeclaration = printer.printList(ListFormat.None, importDeclarationsAsNode, sourceFile);

  const directiveArgumentAndInputFieldMappings = transformDirectiveArgumentAndInputFieldMappings(
    config.directiveArgumentAndInputFieldMappings ?? {},
    config.directiveArgumentAndInputFieldMappingTypeSuffix
  );

  const directiveArgumentAndInputImports = Object.entries(directiveArgumentAndInputFieldMappings).flatMap(
    ([_, directiveValue]) => {
      if (directiveValue.isExternal) {
        if (directiveValue.default) {
          return factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
              config.useTypeImports ?? false,
              undefined,
              factory.createNamedImports([
                factory.createImportSpecifier(
                  false,
                  factory.createIdentifier('default'),
                  factory.createIdentifier(directiveValue.import)
                ),
              ])
            ),
            factory.createStringLiteral(directiveValue.source)
          );
        }
        return factory.createImportDeclaration(
          undefined,
          factory.createImportClause(
            config.useTypeImports ?? false,
            factory.createIdentifier(directiveValue.import),
            undefined
          ),
          factory.createStringLiteral(directiveValue.source)
        );
      }

      return [];
    }
  );

  const directiveArgumentAndInputImportsAsNode = factory.createNodeArray(
    directiveArgumentAndInputImports.filter(Boolean)
  );
  const directiveImportsDeclaration = printer.printList(
    ListFormat.None,
    directiveArgumentAndInputImportsAsNode,
    sourceFile
  );

  return {
    // tsAST: TODO,
    prepend: [
      enumImportsDeclaration,
      directiveImportsDeclaration,
      ...gqlTsLeaveVisitors.getScalarsImports(),
      ...gqlTsLeaveVisitors.getWrapperDefinitions(),
    ].filter(Boolean),
    content: [
      // todo: yes, that sucks
      scalarsTypeDeclaration.replace(/\s{4}(?=\w)/g, '  ') + '\n',
      directivesDeclaration,
      ...visitorResult.definitions,
      ...introspectionDefinitions,
    ]
      .filter(Boolean)
      .join('\n'),
  };
};
