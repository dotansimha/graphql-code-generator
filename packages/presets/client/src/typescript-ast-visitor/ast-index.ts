// import { PluginFunction, Types, oldVisit } from '@graphql-codegen/plugin-helpers';
// import { transformSchemaAST } from '@graphql-codegen/schema-ast';
// import {
//   EmitHint,
//   ImportDeclaration,
//   ImportEqualsDeclaration,
//   ListFormat,
//   NewLineKind,
//   ScriptKind,
//   ScriptTarget,
//   SyntaxKind,
//   addSyntheticLeadingComment,
//   createPrinter,
//   createSourceFile,
//   factory,
// } from 'typescript';

// import {
//   DocumentNode,
//   GraphQLNamedType,
//   GraphQLSchema,
//   TypeInfo,
//   getNamedType,
//   isIntrospectionType,
//   isObjectType,
//   parse,
//   printIntrospectionSchema,
//   visit,
//   visitWithTypeInfo,
// } from 'graphql';

// import {
//   ExternalParsedMapper,
//   buildScalarsFromConfig,
//   convertFactory,
//   parseEnumValues,
//   transformComment,
//   transformDirectiveArgumentAndInputFieldMappings,
// } from '@graphql-codegen/visitor-plugin-common';
// import { TypeScriptrawConfig } from './config';
// import { TsVisitor } from './visitor';
// // todo
// import { TsIntrospectionVisitor } from '@graphql-codegen/typescript';

// const astPlugin = ({
//   schema: rawSchema,
//   documents,
//   config: rawConfig,
// }: {
//   schema: GraphQLSchema;
//   documents: Types.DocumentFile[];
//   config: TypeScriptrawConfig;
// }) => {
//   const config = parseConfig(rawConfig);
//   const { schema, ast } = transformSchemaAST(rawSchema, rawConfig);

//   // Just for debugging
//   const sourceFile = createSourceFile('graphql.ts', '', ScriptTarget.ES2020, false, ScriptKind.TSX);
//   const printer = createPrinter({ omitTrailingSemicolon: false, newLine: NewLineKind.CarriageReturnLineFeed });

//   // Scalars
//   const scalarsMap = buildScalarsFromConfig(schema, rawConfig);
//   const scalars = Object.keys(scalarsMap).map(scalarName => {
//     const scalarValue = scalarsMap[scalarName].type;
//     const scalarType = schema.getType(scalarName);
//     const comment = scalarType?.astNode && scalarType.description ? transformComment(scalarType.description, 1) : '';

//     const propertySignature = factory.createPropertySignature(
//       undefined,
//       scalarName,
//       undefined,
//       factory.createTypeReferenceNode(scalarValue)
//     );

//     if (comment) {
//       addSyntheticLeadingComment(propertySignature, SyntaxKind.MultiLineCommentTrivia, comment, true);
//     }

//     return propertySignature;
//   });

//   const scalarsTypeAliasDeclaration = factory.createTypeAliasDeclaration(
//     [factory.createModifier(SyntaxKind.ExportKeyword)],
//     'Scalars',
//     undefined,
//     factory.createTypeLiteralNode(scalars)
//   );

//   addSyntheticLeadingComment(
//     scalarsTypeAliasDeclaration,
//     SyntaxKind.MultiLineCommentTrivia,
//     // TODO: that's an ugly workaround
//     '* All built-in and custom scalars, mapped to their actual values ',
//     true
//   );

//   let scalarsTypeDeclaration = printer.printNode(EmitHint.Unspecified, scalarsTypeAliasDeclaration, sourceFile);
//   console.log('>>>>>>>>>>>>>>>>>>>>>>>> scalars ', scalarsTypeDeclaration);

//   // directiveArgumentAndInputFieldMappings

//   const directiveEntries = Object.entries(rawConfig.directiveArgumentAndInputFieldMappings || {});
//   const directives = directiveEntries.map(([directiveName, directiveValue]) => {
//     const directiveType = schema.getDirective(directiveName);
//     const comment =
//       directiveType?.astNode && directiveType.description ? transformComment(directiveType.description, 1) : '';

//     const propertySignature = factory.createPropertySignature(
//       undefined,
//       directiveName,
//       undefined,
//       factory.createTypeReferenceNode(directiveValue)
//     );

//     if (comment) {
//       addSyntheticLeadingComment(propertySignature, SyntaxKind.MultiLineCommentTrivia, comment, true);
//     }

//     return propertySignature;
//   });

//   const directivestTypeAliasDeclaration = factory.createTypeAliasDeclaration(
//     undefined,
//     'DirectiveArgumentAndInputFieldMappings',
//     undefined,
//     factory.createTypeLiteralNode(directives)
//   );

//   addSyntheticLeadingComment(
//     directivestTypeAliasDeclaration,
//     SyntaxKind.SingleLineCommentTrivia,
//     'Type overrides using directives',
//     true
//   );

//   scalarsTypeDeclaration = printer.printNode(EmitHint.Unspecified, directivestTypeAliasDeclaration, sourceFile);
//   console.log('>>>>>>>>>>>>>>>>>>>>>>>> directives ', scalarsTypeDeclaration);

//   // enum imports
//   const parsedEnumValues = parseEnumValues({
//     schema,
//     mapOrStr: rawConfig.enumValues!,
//     ignoreEnumValuesFromSchema: rawConfig.ignoreEnumValuesFromSchema,
//   });

//   const enumImportDeclarations = Object.keys(parsedEnumValues).flatMap(
//     (enumName): Array<ImportDeclaration | ImportEqualsDeclaration> => {
//       const mappedValue = parsedEnumValues[enumName];

//       if (!mappedValue.sourceFile) {
//         return [];
//       }

//       if (mappedValue.isDefault) {
//         const importDeclaration = factory.createImportDeclaration(
//           undefined,
//           factory.createImportClause(
//             config.useTypeImports,
//             undefined,
//             factory.createNamedImports([
//               factory.createImportSpecifier(
//                 false,
//                 factory.createIdentifier('default'),
//                 factory.createIdentifier(mappedValue.typeIdentifier)
//               ),
//             ])
//           ),
//           factory.createStringLiteral(mappedValue.sourceFile)
//         );

//         return [importDeclaration];
//       }

//       if (mappedValue.importIdentifier !== mappedValue.sourceIdentifier) {
//         // use namespace import to dereference nested enum
//         // { enumValues: { MyEnum: './my-file#NS.NestedEnum' } }
//         const importDeclaration = factory.createImportDeclaration(
//           undefined,
//           factory.createImportClause(
//             config.useTypeImports,
//             factory.createIdentifier(mappedValue.importIdentifier || mappedValue.sourceIdentifier || ''),
//             undefined
//           ),
//           factory.createStringLiteral(mappedValue.sourceFile)
//         );

//         const importEqualsDeclaration = factory.createImportEqualsDeclaration(
//           undefined,
//           false,
//           factory.createIdentifier(mappedValue.typeIdentifier),
//           factory.createIdentifier(mappedValue.sourceIdentifier!)
//         );

//         return [importDeclaration, importEqualsDeclaration];
//       }

//       if (mappedValue.sourceIdentifier !== mappedValue.typeIdentifier) {
//         return [
//           factory.createImportDeclaration(
//             undefined,
//             factory.createImportClause(
//               config.useTypeImports,
//               undefined,
//               factory.createNamedImports([
//                 factory.createImportSpecifier(
//                   false,
//                   factory.createIdentifier(mappedValue.sourceIdentifier!),
//                   factory.createIdentifier(mappedValue.typeIdentifier)
//                 ),
//               ])
//             ),
//             factory.createStringLiteral(mappedValue.sourceFile)
//           ),
//         ];
//       }

//       return [
//         factory.createImportDeclaration(
//           undefined,
//           factory.createImportClause(
//             config.useTypeImports,
//             factory.createIdentifier(mappedValue.importIdentifier || mappedValue.sourceIdentifier || ''),
//             undefined
//           ),
//           factory.createStringLiteral(mappedValue.sourceFile)
//         ),
//       ];
//     }
//   );

//   const importDeclarationsAsNode = factory.createNodeArray(enumImportDeclarations.filter(Boolean));
//   scalarsTypeDeclaration = printer.printList(ListFormat.None, importDeclarationsAsNode, sourceFile);
//   console.log('>>>>>>>>>>>>>>>>>>>>>>>> importDeclarationsAsNode ', scalarsTypeDeclaration);

//   const directiveArgumentAndInputFieldMappings = transformDirectiveArgumentAndInputFieldMappings(
//     rawConfig.directiveArgumentAndInputFieldMappings ?? {},
//     rawConfig.directiveArgumentAndInputFieldMappingTypeSuffix
//   );

//   const directiveArgumentAndInputImports = Object.entries(directiveArgumentAndInputFieldMappings).flatMap(
//     ([_, directiveValue]) => {
//       if (directiveValue.isExternal) {
//         if (directiveValue.default) {
//           return factory.createImportDeclaration(
//             undefined,
//             factory.createImportClause(
//               config.useTypeImports,
//               undefined,
//               factory.createNamedImports([
//                 factory.createImportSpecifier(
//                   false,
//                   factory.createIdentifier('default'),
//                   factory.createIdentifier(directiveValue.import)
//                 ),
//               ])
//             ),
//             factory.createStringLiteral(directiveValue.source)
//           );
//         }
//         return factory.createImportDeclaration(
//           undefined,
//           factory.createImportClause(config.useTypeImports, factory.createIdentifier(directiveValue.import), undefined),
//           factory.createStringLiteral(directiveValue.source)
//         );
//       }

//       return [];
//     }
//   );

//   const directiveArgumentAndInputImportsAsNode = factory.createNodeArray(
//     directiveArgumentAndInputImports.filter(Boolean)
//   );
//   scalarsTypeDeclaration = printer.printList(ListFormat.None, directiveArgumentAndInputImportsAsNode, sourceFile);
//   console.log('>>>>>>>>>>>>>>>>>>>>>>>> directiveArgumentAndInputImportsAsNode ', scalarsTypeDeclaration);

//   const scalarsImports = Object.values(scalarsMap)
//     .filter((scalar): scalar is ExternalParsedMapper => scalar.isExternal)
//     .map(scalar => {
//       const importClause = scalar.default
//         ? factory.createImportClause(
//             config.useTypeImports,
//             undefined,
//             factory.createNamedImports([
//               factory.createImportSpecifier(
//                 false,
//                 factory.createIdentifier('default'),
//                 factory.createIdentifier(scalar.import)
//               ),
//             ])
//           )
//         : factory.createImportClause(config.useTypeImports, factory.createIdentifier(scalar.import), undefined);

//       return factory.createImportDeclaration(undefined, importClause, factory.createStringLiteral(scalar.source));
//     });

//   const scalarsImportsAsNode = factory.createNodeArray(scalarsImports);
//   scalarsTypeDeclaration = printer.printList(ListFormat.None, scalarsImportsAsNode, sourceFile);
//   console.log('>>>>>>>>>>>>>>>>>>>>>>>> scalarsImportsAsNode ', scalarsTypeDeclaration);

//   const wrapperDefinitions = [];
//   if (!config.onlyEnums) {
//     const maybeValueDeclaration = factory.createTypeAliasDeclaration(
//       [factory.createModifier(SyntaxKind.ExportKeyword)],
//       factory.createIdentifier('Maybe'),
//       [factory.createTypeParameterDeclaration(undefined, factory.createIdentifier('T'), undefined, undefined)],
//       factory.createUnionTypeNode([
//         factory.createTypeReferenceNode(factory.createIdentifier('T'), undefined),
//         factory.createLiteralTypeNode(factory.createNull()),
//       ])
//     );
//     wrapperDefinitions.push(maybeValueDeclaration);

//     const inputMaybeValueDeclaration = factory.createTypeAliasDeclaration(
//       [factory.createModifier(SyntaxKind.ExportKeyword)],
//       factory.createIdentifier('InputMaybe'),
//       [factory.createTypeParameterDeclaration(undefined, factory.createIdentifier('T'), undefined, undefined)],
//       factory.createTypeReferenceNode(factory.createIdentifier('Maybe'), [
//         factory.createTypeReferenceNode(factory.createIdentifier('T'), undefined),
//       ])
//     );
//     wrapperDefinitions.push(inputMaybeValueDeclaration);

//     wrapperDefinitions.push(
//       factory.createIdentifier('export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };')
//     );
//     wrapperDefinitions.push(
//       factory.createIdentifier(
//         'export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };'
//       )
//     );
//     wrapperDefinitions.push(
//       factory.createIdentifier(
//         'export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };'
//       )
//     );
//   }

//   // prepend: [
//   // ✅ ...visitor.getEnumsImports(),
//   // ✅ ...visitor.getDirectiveArgumentAndInputFieldMappingsImports(),
//   // ✅ ...visitor.getScalarsImports(),
//   // ✅ ...visitor.getWrapperDefinitions(),
//   // ].filter(Boolean),
//   // content: [
//   // ✅ scalars,
//   // ✅ directiveArgumentAndInputFieldMappings,
//   //   ...visitorResult.definitions,
//   //   ...introspectionDefinitions,
//   // ]

//   const visitor = new TsVisitor(schema, rawConfig);

//   const visitorResult = oldVisit(ast, { leave: visitor });
//   const introspectionDefinitions = includeIntrospectionTypesDefinitions(schema, documents, config);
//   const scalars_ = visitor.scalarsDefinition;
//   const directiveArgumentAndInputFieldMappings_ = visitor.directiveArgumentAndInputFieldMappingsDefinition;

//   return {
//     prepend: [
//       ...visitor.getEnumsImports(),
//       ...visitor.getDirectiveArgumentAndInputFieldMappingsImports(),
//       ...visitor.getScalarsImports(),
//       ...visitor.getWrapperDefinitions(),
//     ].filter(Boolean),
//     content: [
//       scalars_,
//       directiveArgumentAndInputFieldMappings_,
//       ...visitorResult.definitions,
//       ...introspectionDefinitions,
//     ]
//       .filter(Boolean)
//       .join('\n'),
//   };

//   // return {
//   //   prepend: [
//   //     printer.printList(
//   //       ListFormat.MultiLine,
//   //       factory.createNodeArray([
//   //         ...enumImportDeclarations,
//   //         ...directiveArgumentAndInputImports,
//   //         ...scalarsImports,
//   //         ...wrapperDefinitions,
//   //       ]),
//   //       sourceFile
//   //     ),
//   //   ],
//   //   content: [
//   //     printer.printList(ListFormat.MultiLine, factory.createNodeArray([scalarsTypeAliasDeclaration]), sourceFile),
//   //     ...visitorResult.definitions,
//   //     ...introspectionDefinitions,
//   //   ]
//   //     .filter(Boolean)
//   //     .join(''),
//   // };
// };

// export const plugin: PluginFunction<TypeScriptrawConfig, Types.ComplexPluginOutput> = (schema, documents, config) => {
//   return astPlugin({
//     schema,
//     documents,
//     config,
//   });
// };

// function parseConfig(rawConfig: TypeScriptrawConfig) {
//   return {
//     convert: convertFactory(rawConfig),
//     typesPrefix: rawConfig.typesPrefix || '',
//     typesSuffix: rawConfig.typesSuffix || '',
//     externalFragments: rawConfig.externalFragments || [],
//     fragmentImports: rawConfig.fragmentImports || [],
//     addTypename: !rawConfig.skipTypename,
//     nonOptionalTypename: !!rawConfig.nonOptionalTypename,
//     useTypeImports: !!rawConfig.useTypeImports,
//     allowEnumStringTypes: !!rawConfig.allowEnumStringTypes,
//     inlineFragmentTypes: rawConfig.inlineFragmentTypes ?? 'inline',
//     emitLegacyCommonJSImports:
//       rawConfig.emitLegacyCommonJSImports === undefined ? true : !!rawConfig.emitLegacyCommonJSImports,
//     noExport: getConfigValue(rawConfig.noExport, false),
//     avoidOptionals: normalizeAvoidOptionals(getConfigValue(rawConfig.avoidOptionals, false)),
//     maybeValue: getConfigValue(rawConfig.maybeValue, 'T | null'),
//     inputMaybeValue: getConfigValue(rawConfig.inputMaybeValue, getConfigValue(rawConfig.maybeValue, 'Maybe<T>')),
//     constEnums: getConfigValue(rawConfig.constEnums, false),
//     enumsAsTypes: getConfigValue(rawConfig.enumsAsTypes, false),
//     futureProofEnums: getConfigValue(rawConfig.futureProofEnums, false),
//     futureProofUnions: getConfigValue(rawConfig.futureProofUnions, false),
//     enumsAsConst: getConfigValue(rawConfig.enumsAsConst, false),
//     numericEnums: getConfigValue(rawConfig.numericEnums, false),
//     onlyEnums: getConfigValue(rawConfig.onlyEnums, false),
//     onlyOperationTypes: getConfigValue(rawConfig.onlyOperationTypes, false),
//     immutableTypes: getConfigValue(rawConfig.immutableTypes, false),
//     useImplementingTypes: getConfigValue(rawConfig.useImplementingTypes, false),
//     entireFieldWrapperValue: getConfigValue(rawConfig.entireFieldWrapperValue, 'T'),
//     wrapEntireDefinitions: getConfigValue(rawConfig.wrapEntireFieldDefinitions, false),
//   };
// }

// export function includeIntrospectionTypesDefinitions(
//   schema: GraphQLSchema,
//   documents: Types.DocumentFile[],
//   config: TypeScriptrawConfig
// ): string[] {
//   const typeInfo = new TypeInfo(schema);
//   const usedTypes: GraphQLNamedType[] = [];
//   const documentsVisitor = visitWithTypeInfo(typeInfo, {
//     Field() {
//       const type = getNamedType(typeInfo.getType());

//       if (type && isIntrospectionType(type) && !usedTypes.includes(type)) {
//         usedTypes.push(type);
//       }
//     },
//   });

//   for (const doc of documents) {
//     visit(doc.document, documentsVisitor);
//   }

//   const typesToInclude: GraphQLNamedType[] = [];

//   for (const type of usedTypes) {
//     collectTypes(type);
//   }

//   const visitor = new TsIntrospectionVisitor(schema, config, typesToInclude);
//   const result: DocumentNode = oldVisit(parse(printIntrospectionSchema(schema)), { leave: visitor });

//   // recursively go through each `usedTypes` and their children and collect all used types
//   // we don't care about Interfaces, Unions and others, but Objects and Enums
//   function collectTypes(type: GraphQLNamedType): void {
//     if (typesToInclude.includes(type)) {
//       return;
//     }

//     typesToInclude.push(type);

//     if (isObjectType(type)) {
//       const fields = type.getFields();

//       for (const key of Object.keys(fields)) {
//         const field = fields[key];
//         const type = getNamedType(field.type);
//         collectTypes(type);
//       }
//     }
//   }

//   return result.definitions as any[];
// }

// export const getConfigValue = <T = any>(value: T, defaultValue: T): T => {
//   if (value === null || value === undefined) {
//     return defaultValue;
//   }

//   return value;
// };

// export const DEFAULT_AVOID_OPTIONALS = {
//   object: false,
//   inputValue: false,
//   field: false,
//   defaultValue: false,
//   resolvers: false,
// };

// export function normalizeAvoidOptionals(avoidOptionals?: boolean) {
//   if (typeof avoidOptionals === 'boolean') {
//     return {
//       object: avoidOptionals,
//       inputValue: avoidOptionals,
//       field: avoidOptionals,
//       defaultValue: avoidOptionals,
//       resolvers: avoidOptionals,
//     };
//   }

//   return {
//     ...DEFAULT_AVOID_OPTIONALS,
//     ...(avoidOptionals as any),
//   };
// }
