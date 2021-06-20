import { concatAST, OperationDefinitionNode } from 'graphql';
import { pascalCase } from 'change-case-all';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { convertFactory, getConfigValue } from '@graphql-codegen/visitor-plugin-common';

function getOperationSuffix(
  config: { [key: string]: any },
  node: OperationDefinitionNode | string,
  operationType: string
): string {
  const { omitOperationSuffix = false, dedupeOperationSuffix = false } = config || {};
  const operationName = typeof node === 'string' ? node : node.name ? node.name.value : '';
  return omitOperationSuffix
    ? ''
    : dedupeOperationSuffix && operationName.toLowerCase().endsWith(operationType.toLowerCase())
    ? ''
    : operationType;
}

export const plugin: PluginFunction<Record<string, any>, Types.ComplexPluginOutput> = (schema, documents, config) => {
  const allAst = concatAST(documents.map(v => v.document));
  const convertName = convertFactory(config);
  const operationResultSuffix = getConfigValue(config.operationResultSuffix, '');

  const out = allAst.definitions
    .map(node => {
      if (node.kind === 'OperationDefinition' && node.name?.value) {
        const operationType: string = pascalCase(node.operation);
        const operationTypeSuffix: string = getOperationSuffix(config, node, operationType);
        const operationVariablesTypes: string = convertName(node, {
          suffix: operationTypeSuffix + 'Variables',
        });
        const storeTypeName: string = convertName(node, {
          suffix: operationTypeSuffix + 'Store',
        });
        const operationResultType: string = convertName(node, {
          suffix: operationTypeSuffix + operationResultSuffix,
        });

        return `export type ${storeTypeName} = OperationStore<${operationResultType}, ${operationVariablesTypes}>;`;
      }

      return null;
    })
    .filter(Boolean);

  return {
    prepend: [`import type { OperationStore } from '@urql/svelte';`],
    content: out.filter(Boolean).join('\n'),
  };
};
