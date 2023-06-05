import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';

import { TypeScriptPluginConfig } from './config';
import {
  EmitHint,
  ImportDeclaration,
  ImportEqualsDeclaration,
  ListFormat,
  NewLineKind,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  addSyntheticLeadingComment,
  createPrinter,
  createSourceFile,
  factory,
} from 'typescript';
import {
  type ParsedScalarsMap,
  buildScalarsFromConfig,
  parseEnumValues,
  transformComment,
  transformDirectiveArgumentAndInputFieldMappings,
} from '@graphql-codegen/visitor-plugin-common';
import {
  type DocumentNode,
  visit,
  GraphQLSchema,
  TypeInfo,
  GraphQLNamedType,
  visitWithTypeInfo,
  getNamedType,
  isIntrospectionType,
  parse,
  printIntrospectionSchema,
  isObjectType,
} from 'graphql';
import { typeScriptASTVisitor } from './visitor';

export function includeIntrospectionTypesDefinitions(
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptPluginConfig
): string[] {
  const typeInfo = new TypeInfo(schema);
  const usedTypes: GraphQLNamedType[] = [];
  const documentsVisitor = visitWithTypeInfo(typeInfo, {
    Field() {
      const type = getNamedType(typeInfo.getType());

      if (type && isIntrospectionType(type) && !usedTypes.includes(type)) {
        usedTypes.push(type);
      }
    },
  });

  for (const doc of documents) {
    if (doc.document) {
      visit(doc.document, documentsVisitor);
    }
  }

  const typesToInclude: GraphQLNamedType[] = [];

  for (const type of usedTypes) {
    collectTypes(type);
  }

  const result: DocumentNode = visit(
    parse(printIntrospectionSchema(schema)),
    typeScriptASTVisitor(schema, {}, config, typesToInclude)
  );

  // recursively go through each `usedTypes` and their children and collect all used types
  // we don't care about Interfaces, Unions and others, but Objects and Enums
  function collectTypes(type: GraphQLNamedType): void {
    if (typesToInclude.includes(type)) {
      return;
    }

    typesToInclude.push(type);

    if (isObjectType(type)) {
      const fields = type.getFields();

      for (const key of Object.keys(fields)) {
        const field = fields[key];
        const type = getNamedType(field.type);
        collectTypes(type);
      }
    }
  }

  return result.definitions as any[];
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

  const visitorResult: DocumentNode = visit(gqlDocumentNode, typeScriptASTVisitor(_schema, scalarsMap, config));
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
      ...getScalarsImports(scalarsMap, config.useTypeImports ?? false),
      ...getWrapperDefinitions(config),
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

function getScalarsImports(scalars: ParsedScalarsMap, useTypeImports: boolean): string[] {
  return Object.keys(scalars)
    .map(enumName => {
      const mappedValue = scalars[enumName];

      if (mappedValue.isExternal) {
        return buildTypeImport(mappedValue.import, mappedValue.source, mappedValue.default, useTypeImports);
      }

      return '';
    })
    .filter(Boolean);
}

function buildTypeImport(identifier: string, source: string, asDefault = false, useTypeImports: boolean): string {
  if (asDefault) {
    if (useTypeImports) {
      return `import type { default as ${identifier} } from '${source}';`;
    }
    return `import ${identifier} from '${source}';`;
  }
  return `import${useTypeImports ? ' type' : ''} { ${identifier} } from '${source}';`;
}

export const EXACT_SIGNATURE = `type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };`;
export const MAKE_OPTIONAL_SIGNATURE = `type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };`;
export const MAKE_MAYBE_SIGNATURE = `type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };`;

function getWrapperDefinitions(config: TypeScriptPluginConfig): string[] {
  if (config.onlyEnums) return [];
  let exportPrefix = 'export ';
  if (config.noExport) {
    exportPrefix = '';
  }

  const exactDefinition = `${exportPrefix}${EXACT_SIGNATURE}`;

  const optionalDefinition = `${exportPrefix}${MAKE_OPTIONAL_SIGNATURE}`;

  const maybeDefinition = `${exportPrefix}${MAKE_MAYBE_SIGNATURE}`;

  const maybeValue = `${exportPrefix}type Maybe<T> = ${config.maybeValue || 'T | null'};`;

  const inputMaybeValue = `${exportPrefix}type InputMaybe<T> = ${config.inputMaybeValue || 'Maybe<T>'};`;

  const definitions: string[] = [maybeValue, inputMaybeValue, exactDefinition, optionalDefinition, maybeDefinition];

  if (config.wrapFieldDefinitions) {
    const fieldWrapperDefinition = `${exportPrefix}type FieldWrapper<T> = ${config.fieldWrapperValue};`;
    definitions.push(fieldWrapperDefinition);
  }
  if (config.wrapEntireFieldDefinitions) {
    const entireFieldWrapperDefinition = `${exportPrefix}type EntireFieldWrapper<T> = ${
      config.entireFieldWrapperValue || 'T'
    };`;
    definitions.push(entireFieldWrapperDefinition);
  }

  return definitions;
}
