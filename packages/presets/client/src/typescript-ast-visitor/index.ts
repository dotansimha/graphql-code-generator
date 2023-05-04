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
  parseEnumValues,
  transformComment,
  transformDirectiveArgumentAndInputFieldMappings,
} from '@graphql-codegen/visitor-plugin-common';

export const plugin: PluginFunction<TypeScriptPluginConfig, Types.ComplexPluginOutput> = (
  schema,
  documents,
  config
) => {
  const { schema: _schema, ast } = transformSchemaAST(schema, config);

  const sourceFile = createSourceFile('graphql.ts', '', ScriptTarget.ES2020, false, ScriptKind.TSX);
  const printer = createPrinter({ omitTrailingSemicolon: false, newLine: NewLineKind.CarriageReturnLineFeed });

  const visitor = new TsVisitor(_schema, config);

  const visitorResult = oldVisit(ast, { leave: visitor as any }); // todo
  const introspectionDefinitions = includeIntrospectionTypesDefinitions(_schema, documents, config);

  // Scalars
  const scalarsMap = buildScalarsFromConfig(schema, config);
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
    prepend: [
      enumImportsDeclaration,
      directiveImportsDeclaration,
      ...visitor.getScalarsImports(),
      ...visitor.getWrapperDefinitions(),
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
