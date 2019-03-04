import { BaseVisitor, ParsedConfig } from 'graphql-codegen-visitor-plugin-common';
import { ReactApolloRawPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { GraphQLSchema, FragmentDefinitionNode, print, OperationDefinitionNode } from 'graphql';
import { DepGraph } from 'dependency-graph';
import gqlTag from 'graphql-tag';
import { pascalCase } from 'change-case';
import { toPascalCase } from 'graphql-codegen-core';

export interface ReactApolloPluginConfig extends ParsedConfig {
  noHOC: boolean;
  noComponents: boolean;
  withHooks: boolean;
  hooksImportFrom: string;
  gqlImport: string;
}

export class ReactApolloVisitor extends BaseVisitor<ReactApolloRawPluginConfig, ReactApolloPluginConfig> {
  constructor(private _fragments: FragmentDefinitionNode[], rawConfig: ReactApolloRawPluginConfig) {
    super(rawConfig, {
      noHOC: rawConfig.noHOC || false,
      noComponents: rawConfig.noComponents || false,
      withHooks: rawConfig.withHooks || false,
      hooksImportFrom: rawConfig.hooksImportFrom || 'react-apollo-hooks',
      gqlImport: rawConfig.gqlImport || null
    } as any);

    autoBind(this);
  }

  private _getFragmentName(fragment: FragmentDefinitionNode | string): string {
    return (typeof fragment === 'string' ? fragment : fragment.name.value) + 'FragmentDoc';
  }

  private _extractFragments(document: FragmentDefinitionNode | OperationDefinitionNode): string[] | undefined {
    return (print(document).match(/\.\.\.[a-z0-9\_]+/gi) || []).map(name => name.replace('...', ''));
  }

  private _transformFragments(document: FragmentDefinitionNode | OperationDefinitionNode): string[] | undefined {
    return this._extractFragments(document).map(document => this._getFragmentName(document));
  }

  private _includeFragments(fragments: string[]): string {
    if (fragments) {
      return `${fragments
        .filter((name, i, all) => all.indexOf(name) === i)
        .map(name => '${' + name + '}')
        .join('\n')}`;
    }

    return '';
  }

  private _gql(node: FragmentDefinitionNode | OperationDefinitionNode): string {
    const doc = `
${print(node)}
${this._includeFragments(this._transformFragments(node))}`;

    return this.config.gqlImport ? JSON.stringify(gqlTag(doc)) : 'gql`' + doc + '`';
  }

  private _generateFragment(fragmentDocument: FragmentDefinitionNode): string | void {
    const name = this._getFragmentName(fragmentDocument);

    return `export const ${name} = ${this._gql(fragmentDocument)};`;
  }

  get fragments(): string {
    if (this._fragments.length === 0) {
      return '';
    }

    const graph = new DepGraph<FragmentDefinitionNode>({ circular: true });

    for (const fragment of this._fragments) {
      if (graph.hasNode(fragment.name.value)) {
        const cachedAsString = print(graph.getNodeData(fragment.name.value));
        const asString = print(fragment);

        if (cachedAsString !== asString) {
          throw new Error(`Duplicated fragment called '${fragment.name}'!`);
        }
      }

      graph.addNode(fragment.name.value, fragment);
    }

    this._fragments.forEach(fragment => {
      const depends = this._extractFragments(fragment);

      if (depends) {
        depends.forEach(name => {
          graph.addDependency(fragment.name.value, name);
        });
      }
    });

    return graph
      .overallOrder()
      .map(name => this._generateFragment(graph.getNodeData(name)))
      .join('\n');
  }

  private _parseImport(importStr: string) {
    const [moduleName, propName] = importStr.split('#');

    return {
      moduleName,
      propName
    };
  }

  get imports(): string {
    const gqlImport = this._parseImport(this.config.gqlImport || 'graphql-tag');
    let imports = `
import ${
      gqlImport.propName ? `{ ${gqlImport.propName === 'gql' ? 'gql' : `${gqlImport.propName} as gql`} }` : 'gql'
    } from '${gqlImport.moduleName}';\n`;

    if (!this.config.noComponents) {
      imports += `import * as React from 'react';\n`;
    }

    if (!this.config.noComponents || !this.config.noHOC) {
      imports += `import * as ReactApollo from 'react-apollo';\n`;
    }

    if (this.config.withHooks) {
      imports += `import * as ReactApolloHooks from '${
        typeof this.config.hooksImportFrom === 'string' ? this.config.hooksImportFrom : 'react-apollo-hooks'
      }';\n`;
    }

    return imports;
  }

  private _buildHocProps(operationName: string, operationType: string): string {
    const typeVariableName = this.convertName(operationName + toPascalCase(operationType));
    const variablesVarName = this.convertName(operationName + toPascalCase(operationType) + 'Variables');
    const argType = operationType === 'mutation' ? 'MutateProps' : 'DataProps';

    return `Partial<ReactApollo.${argType}<${typeVariableName}, ${variablesVarName}>>`;
  }

  private _buildOperationHoc(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const operationName: string = this.convertName(node.name.value);
    const propsTypeName: string = operationName + 'Props';

    const propsVar = `export type ${propsTypeName}<TChildProps = any> = ${this._buildHocProps(
      node.name.value,
      node.operation
    )} & TChildProps;`;

    const mutationFn =
      node.operation === 'mutation'
        ? `export type ${this.convertName(
            node.name.value + 'MutationFn'
          )} = ReactApollo.MutationFn<${operationResultType}, ${operationVariablesTypes}>;`
        : null;

    const hocString = `export function ${operationName}HOC<TProps, TChildProps = any>(operationOptions: ReactApollo.OperationOption<
  TProps, 
  ${operationResultType},
  ${operationVariablesTypes},
  ${propsTypeName}<TChildProps>> | undefined) {
    return ReactApollo.graphql<TProps, ${operationResultType}, ${operationVariablesTypes}, ${propsTypeName}<TChildProps>>(${documentVariableName}, operationOptions);
};`;

    return [propsVar, mutationFn, hocString].filter(a => a).join('\n');
  }

  private _buildComponent(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const componentName: string = this.convertName(node.name.value + 'Component');

    return `
export class ${componentName} extends React.Component<Partial<ReactApollo.${operationType}Props<${operationResultType}, ${operationVariablesTypes}>>> {
  render() {
      return (
          <ReactApollo.${operationType}<${operationResultType}, ${operationVariablesTypes}>
          ${node.operation}={${documentVariableName}}
          {...(this as any)['props'] as any}
          />
      );
  }
}`;
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    if (!node.name || !node.name.value) {
      return null;
    }

    const documentVariableName = this.convertName(node.name.value + 'Document');
    const documentString = `export const ${documentVariableName} = ${this._gql(node)};`;
    const operationType: string = toPascalCase(node.operation);
    const operationResultType: string = this.convertName(node.name.value + operationType);
    const operationVariablesTypes: string = this.convertName(node.name.value + operationType + 'Variables');

    const component = this.config.noComponents
      ? null
      : this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes);
    const hoc = this.config.noHOC
      ? null
      : this._buildOperationHoc(node, documentVariableName, operationResultType, operationVariablesTypes);
    const hooks = this.config.withHooks ? `` : null;

    return [documentString, component, hoc, hooks].filter(a => a).join('\n');
  }
}
