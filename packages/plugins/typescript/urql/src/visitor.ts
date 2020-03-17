import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  getConfigValue,
  OMIT_TYPE,
} from '@graphql-codegen/visitor-plugin-common';
import { UrqlRawPluginConfig } from './config';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, Kind, GraphQLSchema, visit, visitWithTypeInfo, TypeInfo, GraphQLOutputType, isWrappingType, SelectionNode, GraphQLWrappingType } from 'graphql';
import { pascalCase } from 'pascal-case';

export type SelectionSet = ReadonlyArray<SelectionNode>;
export type GraphQLFlatType = Exclude<GraphQLOutputType, GraphQLWrappingType>;

export interface UrqlPluginConfig extends ClientSideBasePluginConfig {
  withAdditionalTypenames?: boolean;
  withComponent: boolean;
  withHooks: boolean;
  urqlImportFrom: string;
}

export class UrqlVisitor extends ClientSideBaseVisitor<UrqlRawPluginConfig, UrqlPluginConfig> {
  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: UrqlRawPluginConfig) {
    super(schema, fragments, rawConfig, {
      withAdditionalTypenames: getConfigValue(rawConfig.withAdditionalTypenames, false),
      withComponent: getConfigValue(rawConfig.withComponent, true),
      withHooks: getConfigValue(rawConfig.withHooks, false),
      urqlImportFrom: getConfigValue(rawConfig.urqlImportFrom, null),
    });

    autoBind(this);
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const imports = [];
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    if (this.config.withComponent) {
      imports.push(`import * as React from 'react';`);
    }

    if (this.config.withComponent || this.config.withHooks) {
      imports.push(`import * as Urql from '${this.config.urqlImportFrom || 'urql'}';`);
    }

    imports.push(OMIT_TYPE);

    return [...baseImports, ...imports];
  }

  private _buildComponent(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const componentName: string = this.convertName(node.name.value, { suffix: 'Component', useTypesPrefix: false });

    const isVariablesRequired =
      operationType === 'Query' &&
      node.variableDefinitions.some(variableDef => variableDef.type.kind === Kind.NON_NULL_TYPE);

    const generics = [operationResultType, operationVariablesTypes];

    if (operationType === 'Subscription') {
      generics.unshift(operationResultType);
    }

    if (this.config.withAdditionalTypenames) {
      return `
export const ${componentName} = (props: Omit<Urql.${operationType}Props<${generics.join(
        ', '
      )}>, 'query'> & { variables${isVariablesRequired ? '' : '?'}: ${operationVariablesTypes} }) => {
        const context = useMemo(() => ({
          ...(props.context || {}),
          additionalTypenames: [${this.getTypenames(node)}],
        }, [props.context]));
        return (
          <Urql.${operationType} {...props} query={${documentVariableName}} context={context} />
        )
      }
`;
    }

    return `
export const ${componentName} = (props: Omit<Urql.${operationType}Props<${generics.join(
      ', '
    )}>, 'query'> & { variables${isVariablesRequired ? '' : '?'}: ${operationVariablesTypes} }) => (
  <Urql.${operationType} {...props} query={${documentVariableName}} />
);
`;
  }

  private _buildHooks(
    node: OperationDefinitionNode,
    operationType: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const operationName: string = this.convertName(node.name.value, {
      suffix: pascalCase(operationType),
      useTypesPrefix: false,
    });

    if (operationType === 'Mutation') {
      return `
export function use${operationName}() {
  return Urql.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName});
};`;
    }

    if (operationType === 'Subscription') {
      return `
export function use${operationName}<TData = any>(options: Omit<Urql.Use${operationType}Args<${operationVariablesTypes}>, 'query'> = {}, handler?: Urql.SubscriptionHandler<${operationName}, TData>) {
  return Urql.use${operationType}<${operationResultType}, TData, ${operationVariablesTypes}>({ query: ${documentVariableName}, ...options }, handler);
};`;
    }

    if (this.config.withAdditionalTypenames) {
      return `
export function use${operationName}(options: Omit<Urql.Use${operationType}Args<${operationVariablesTypes}>, 'query'> = {}) {
  const context = useMemo(() => ({
    ...(options.context || {}),
    additionalTypenames: [${this.getTypenames(node)}],
  }, [options.context]));
  return Urql.use${operationType}<${operationResultType}>({ query: ${documentVariableName}, ...options, context });
};`;
    }

    return `
export function use${operationName}(options: Omit<Urql.Use${operationType}Args<${operationVariablesTypes}>, 'query'> = {}) {
  return Urql.use${operationType}<${operationResultType}>({ query: ${documentVariableName}, ...options });
};`;
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const component = this.config.withComponent
      ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes)
      : null;

    const hooks = this.config.withHooks
      ? this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes)
      : null;

    return [component, hooks].filter(a => a).join('\n');
  }

  private getTypenames(
    node: OperationDefinitionNode,
  ) {
    const typenames = [];
    const typeInfo = new TypeInfo(this._schema);

    const fieldVisitor = node => {
      if (node.selectionSet) {
        console.log(node);
        typenames.push(getTypename(typeInfo.getType()));
      }
    };

    visit(
      node,
      visitWithTypeInfo(typeInfo, {
        Field: fieldVisitor,
      })
    );

    return typenames.reduce((acc, type, i) => i === 0 ? `${type}` : `${acc}, ${type}`, '');
  }
}

const unwrapType = (
  type: GraphQLOutputType
): GraphQLFlatType => {
  if (isWrappingType(type)) {
    return unwrapType(type.ofType);
  }

  return type;
};

const getTypename = (type: GraphQLOutputType) => unwrapType(type).toString();
