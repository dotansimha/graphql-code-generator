import type { PluginObj } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import template from '@babel/template';
import type { NodePath } from '@babel/traverse';
import type { Program } from '@babel/types';
import { parse } from 'graphql';

const gqlMagicComment = 'graphql';

export default declare((api): PluginObj => {
  let program: NodePath<Program>;
  return {
    name: 'gql-tag-operations',
    visitor: {
      Program(path) {
        // TODO: load codegen config
        // TODO: initialize ClientSideBaseVisitor

        program = path;
      },
      CallExpression(path) {
        if (path.node.callee.type !== 'Identifier' || path.node.callee.name !== 'gql') {
          return;
        }
        const [argument] = path.node.arguments;
        if (argument == null) {
          return;
        }
        if (argument.type !== 'TemplateLiteral') {
          return;
        }

        const [leadingComment] = argument.leadingComments;

        if (leadingComment == null) {
          return;
        }

        const leadingCommentValue = leadingComment.value.trim().toLowerCase();

        if (leadingCommentValue !== gqlMagicComment) {
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

        // TODO: use ClientSideBaseVisitor.getFragmentVariableName or ClientSideBaseVisitor.getOperationVariableName for generating the import name
        const operationOrFragmentName = firstDefinition.name.value;

        // TODO: figure out how to get the correct "./gql/graphql" when operating within nested stuff
        const importDeclaration = template(`
          import { %%importName%% } from "./gql/graphql"
        `);
        program.unshiftContainer(
          'body',
          importDeclaration({
            importName: api.types.identifier(operationOrFragmentName),
          })
        );
        path.replaceWith(api.types.identifier(operationOrFragmentName));
      },
    },
  };
});
