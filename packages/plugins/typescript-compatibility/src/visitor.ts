import { CompatabilityPluginRawConfig } from './index';
import { BaseVisitor, DeclarationBlock, indent, toPascalCase, getConfigValue } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { ParsedConfig } from '@graphql-codegen/visitor-plugin-common';
import { selectionSetToTypes, SelectionSetToObjectResult } from './selection-set-to-types';

export interface CompatabilityPluginConfig extends ParsedConfig {
  reactApollo: any;
  noNamespaces: boolean;
}

export class CompatabilityPluginVisitor extends BaseVisitor<CompatabilityPluginRawConfig, CompatabilityPluginConfig> {
  constructor(rawConfig: CompatabilityPluginRawConfig, private _schema: GraphQLSchema, options: { reactApollo: any }) {
    super(rawConfig, {
      reactApollo: options.reactApollo,
      noNamespaces: getConfigValue<boolean>(rawConfig.noNamespaces, false),
    } as any);
  }

  protected buildOperationBlock(node: OperationDefinitionNode): string {
    const typeName = toPascalCase(node.operation);
    const baseName = this.convertName(node.name.value, { suffix: `${toPascalCase(node.operation)}` });
    const selectionSetTypes: SelectionSetToObjectResult = {
      [this.convertName('Variables')]: this.convertName(node.name.value, { suffix: `${toPascalCase(node.operation)}Variables` }),
    };

    selectionSetToTypes(this, this._schema, typeName, baseName, node.operation, node.selectionSet, selectionSetTypes);

    return Object.keys(selectionSetTypes)
      .map(typeName => `export type ${typeName} = ${selectionSetTypes[typeName]};`)
      .map(m => indent(m))
      .join('\n');
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const baseName = node.name.value;
    const convertedName = this.convertName(baseName);

    const results = [
      new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind('namespace')
        .withName(convertedName)
        .withBlock(this.buildOperationBlock(node)).string,
    ];

    if (this.config.reactApollo) {
      const reactApolloConfig = this.config.reactApollo[Object.keys(this.config.reactApollo)[0]];
      let hoc = true;
      let component = true;
      let hooks = false;

      if (typeof reactApolloConfig === 'object') {
        if (reactApolloConfig.withHOC === false) {
          hoc = false;
        }

        if (reactApolloConfig.withComponent === false) {
          component = false;
        }

        if (reactApolloConfig.withHooks) {
          hooks = true;
        }
      }

      const pieces = [indent(`export type Props = ${this.convertName(baseName, { suffix: 'Props' })};`), indent(`export const Document = ${this.convertName(baseName, { suffix: 'Document' })};`)];

      if (hoc) {
        pieces.push(indent(`export const HOC = with${convertedName};`));
      }

      if (component) {
        pieces.push(indent(`export const Component = ${this.convertName(baseName, { suffix: 'Component' })};`));
      }

      if (hooks) {
        pieces.push(indent(`export const use = use${this.convertName(baseName, { suffix: toPascalCase(node.operation) })};`));
      }

      results.push(`export namespace ${convertedName} {
${pieces.join('\n')}
}`);
    }

    return results.join('\n');
  }
}
