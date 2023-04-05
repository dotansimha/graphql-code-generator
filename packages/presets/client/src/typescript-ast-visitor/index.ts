import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { ts, Project as TsProject, StructureKind } from 'ts-morph';
import * as typescript from 'typescript';

const { factory } = typescript;

// TODO: Temporary. Inline this later.
import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { GraphQLSchema } from 'graphql';

const astPlugin = ({
  schema,
  documents,
  config,
  project,
}: {
  schema: GraphQLSchema;
  documents: Types.DocumentFile[];
  config: TypeScriptPluginConfig;
  project: TsProject;
}) => {
  const sourceFile = project.createSourceFile('graphql.ts', '');
  const program = typescript.createProgram({
    rootNames: ['graphql.ts'],
    options: {},
  });

  const src = typescript.createSourceFile('graphql.ts', '', typescript.ScriptTarget.ESNext);

  console.log('>>> src.getFullText()', src.getFullText());

  const printer = typescript.createPrinter();
  const printed = printer.printNode(
    typescript.EmitHint.Unspecified,
    factory.createExpressionStatement(
      factory.createPropertyAccessExpression(factory.createIdentifier('console'), factory.createIdentifier('log'))
    ),
    src
  );

  // const expressionStatement =

  sourceFile.addFunction({
    name: 'hello',
    parameters: [{ name: 'name', type: 'string', initializer: "'Olutek'" }],
    statements: [
      //     [],
      //     [
      //       factory.createStringLiteral('Hello'),
      //       // , factory.createIdentifier('name')
      //     ]
      //   )
      // )
      // .getFullText(),
    ],
  });

  console.log('>> sourceFile.getFullText()', sourceFile.getFullText());
  // prepend: [
  //   ...visitor.getEnumsImports(),
  //   ...visitor.getDirectiveArgumentAndInputFieldMappingsImports(),
  //   ...visitor.getScalarsImports(),
  //   ...visitor.getWrapperDefinitions(),
  // ].filter(Boolean),
  // content: [
  //   scalars,
  //   directiveArgumentAndInputFieldMappings,
  //   ...visitorResult.definitions,
  //   ...introspectionDefinitions,
  // ]
};

export const plugin: PluginFunction<TypeScriptPluginConfig, Types.ComplexPluginOutput> = (
  schema,
  documents,
  config
) => {
  const _ = astPlugin({
    schema,
    documents,
    config,
    project: new TsProject({
      useInMemoryFileSystem: true,
    }),
  });

  return {
    content: '',
    prepend: [],
    append: [],
  };
};
