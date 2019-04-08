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

  protected buildOperationBlock(node: OperationDefinitionNode): SelectionSetToObjectResult {
    const typeName = toPascalCase(node.operation);
    const baseName = this.convertName(node.name.value, { suffix: `${toPascalCase(node.operation)}` });
    const typesPrefix = this.config.noNamespaces ? this.convertName(node.name.value) : '';
    const selectionSetTypes: SelectionSetToObjectResult = {
      [typesPrefix + this.convertName('Variables')]: {
        export: 'type',
        name: this.convertName(node.name.value, { suffix: `${toPascalCase(node.operation)}Variables` }),
      },
    };

    selectionSetToTypes(typesPrefix, this, this._schema, typeName, baseName, node.operation, node.selectionSet, selectionSetTypes);

    return selectionSetTypes;
  }

  protected printTypes(selectionSetTypes: SelectionSetToObjectResult): string {
    return Object.keys(selectionSetTypes)
      .filter(typeName => typeName !== selectionSetTypes[typeName].name)
      .map(typeName => `export ${selectionSetTypes[typeName].export} ${typeName} = ${selectionSetTypes[typeName].name};`)
      .map(m => (this.config.noNamespaces ? m : indent(m)))
      .join('\n');
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const baseName = node.name.value;
    const convertedName = this.convertName(baseName);
    const results = [];
    const selectionSetTypes = this.buildOperationBlock(node);

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

      const prefix = this.config.noNamespaces ? convertedName : '';

      selectionSetTypes[prefix + 'Props'] = {
        export: 'type',
        name: this.convertName(baseName, { suffix: 'Props' }),
      };

      selectionSetTypes[prefix + 'Document'] = {
        export: 'const',
        name: this.convertName(baseName, { suffix: 'Document' }),
      };

      if (hoc) {
        selectionSetTypes[prefix + 'HOC'] = {
          export: 'const',
          name: `with${convertedName}`,
        };
      }

      if (component) {
        selectionSetTypes[prefix + 'Component'] = {
          export: 'const',
          name: this.convertName(baseName, { suffix: 'Component' }),
        };
      }

      if (hooks) {
        selectionSetTypes['use' + prefix] = {
          export: 'const',
          name: 'use' + this.convertName(baseName, { suffix: toPascalCase(node.operation) }),
        };
      }
    }

    const operationsBlock = this.printTypes(selectionSetTypes);

    if (!this.config.noNamespaces) {
      results.push(
        new DeclarationBlock(this._declarationBlockConfig)
          .export()
          .asKind('namespace')
          .withName(convertedName)
          .withBlock(operationsBlock).string
      );
    } else {
      results.push(operationsBlock);
    }

    return results.join('\n');
  }
}
