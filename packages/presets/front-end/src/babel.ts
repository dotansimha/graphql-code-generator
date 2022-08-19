import type { PluginObj, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import template from '@babel/template';
import type { NodePath } from '@babel/traverse';
import type { Program } from '@babel/types';
import { ClientSideBaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { buildSchema, parse } from 'graphql';
import * as path from 'path';

const noopSchema = buildSchema(`type Query { _: Int }`);

export default declare((api, opts): PluginObj => {
  const visitor = new ClientSideBaseVisitor(noopSchema, [], {}, {});

  const artifactDirectory = opts['artifactDirectory'] ?? '';
  const gqlTagName = opts['gqlTagName'] || 'gql';

  let program: NodePath<Program>;
  return {
    name: 'front-end-preset',
    visitor: {
      Program(path) {
        program = path;
      },
      CallExpression(path, state) {
        if (path.node.callee.type !== 'Identifier' || path.node.callee.name !== gqlTagName) {
          return;
        }
        const [argument] = path.node.arguments;
        if (argument == null) {
          return;
        }
        if (argument.type !== 'TemplateLiteral') {
          return;
        }

        const [content] = argument.quasis;
        const ast = parse(content.value.raw);

        const [firstDefinition] = ast.definitions;

        if (firstDefinition.kind !== 'FragmentDefinition' && firstDefinition.kind !== 'OperationDefinition') {
          return;
        }

        if (firstDefinition.name == null) {
          return;
        }

        const operationOrFragmentName =
          firstDefinition.kind === 'OperationDefinition'
            ? visitor.getOperationVariableName(firstDefinition)
            : visitor.getFragmentVariableName(firstDefinition);

        const importPath = getRelativeImportPath(state, artifactDirectory);

        const importDeclaration = template(`
          import { %%importName%% } from %%importPath%%
        `);
        program.unshiftContainer(
          'body',
          importDeclaration({
            importName: api.types.identifier(operationOrFragmentName),
            importPath: api.types.stringLiteral(importPath),
          })
        );
        path.replaceWith(api.types.identifier(operationOrFragmentName));
      },
    },
  };
});

function getRelativeImportPath(state: PluginPass, artifactDirectory: string, fileToRequire = 'graphql'): string {
  if (state.file == null) {
    throw new Error('Babel state is missing expected file name');
  }

  const { filename } = state.file.opts;

  const relative = path.relative(path.dirname(filename), path.resolve(artifactDirectory));

  const relativeReference = relative.length === 0 || !relative.startsWith('.') ? './' : '';

  const platformSpecificPath = relativeReference + path.join(relative, fileToRequire);
  // ensure windows paths are written as unix paths
  return platformSpecificPath.split(path.sep).join(path.posix.sep);
}
