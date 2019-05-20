import { BaseJavaVisitor } from './base-java-visitor';
import { ParsedConfig, toPascalCase, indent, indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { buildPackageNameFromPath, JavaDeclarationBlock } from '@graphql-codegen/java-common';
import { GraphQLSchema, OperationDefinitionNode, print, Kind } from 'graphql';
import { JavaApolloAndroidPluginConfig } from './plugin';
import { Imports } from './imports';
import { createHash } from 'crypto';

export interface OperationVisitorConfig extends ParsedConfig {
  package: string;
}

export class OperationVisitor extends BaseJavaVisitor<OperationVisitorConfig> {
  constructor(_schema: GraphQLSchema, rawConfig: JavaApolloAndroidPluginConfig) {
    super(_schema, rawConfig, {
      package: rawConfig.package || buildPackageNameFromPath(process.cwd()),
    });
  }

  private printOperation(node: OperationDefinitionNode): string {
    return print(node)
      .replace(/\r?\n|\r/g, ' ')
      .replace(/"/g, '\\"')
      .trim();
  }

  private buildCtor(className: string, node: OperationDefinitionNode): string {
    const variables = node.variableDefinitions || [];
    const hasVariables = variables.length > 0;
    const variablesArgs = (node.variableDefinitions || []).map(v => this.getFieldWithTypePrefix(v, null, true)).join(', ');
    const nonNullVariables = variables
      .filter(v => v.type.kind === Kind.NON_NULL_TYPE)
      .map(v => {
        this._imports.add(Imports.Utils);

        return indent(`Utils.checkNotNull(${v.variable.name.value}, "${v.variable.name.value} == null");`);
      })
      .join('\n');

    return indentMultiline(`public ${className}(${variablesArgs}) {
${nonNullVariables}      
  this.variables = ${!hasVariables ? 'Operation.EMPTY_VARIABLES' : `new ${className}.Variables(${variables.map(v => v.variable.name.value).join(', ')})`};
}`);
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const operationType = toPascalCase(node.operation);
    const className = node.name.value.endsWith(operationType) ? operationType : `${node.name.value}${operationType}`;
    this._imports.add(Imports[operationType]);
    this._imports.add(Imports.String);
    this._imports.add(Imports.Override);
    this._imports.add(Imports.Generated);
    this._imports.add(Imports.OperationName);
    this._imports.add(Imports.ResponseFieldMapper);

    const printedOperation = this.printOperation(node);
    const operationDefinition = indent(`public static final String OPERATION_DEFINITION = "${printedOperation}";`);
    const queryDefinition = indent(`public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;`);
    const operationName = indentMultiline(`private static final OperationName OPERATION_NAME = new OperationName() {
  @Override
  public String name() {
    return "${node.name.value}";
  }
};`);
    const variablesVar = indent(`private final ${className}.Variables variables;`);
    const ctor = this.buildCtor(className, node);
    const operationId = indentMultiline(`@Override
public String operationId() {
  return "${createHash('md5')
    .update(printedOperation)
    .digest('hex')}";
}`);
    const mixedDeclarations = indentMultiline(`@Override
public String queryDocument() {
  return QUERY_DOCUMENT;
}

@Override
public ${className}.Data wrapData(${className}.Data data) {
  return data;
}

@Override
public ${className}.Variables variables() {
  return variables;
}

@Override
public ResponseFieldMapper<${className}.Data> responseFieldMapper() {
  return new Data.Mapper();
}

public static Builder builder() {
  return new Builder();
}

@Override
public OperationName name() {
  return OPERATION_NAME;
}`);

    const block = [operationDefinition, queryDefinition, operationName, variablesVar, ctor, operationId, mixedDeclarations].join('\n\n');

    return new JavaDeclarationBlock()
      .annotate([`Generated("Apollo GraphQL")`])
      .access('public')
      .final()
      .asKind('class')
      .withName(className)
      .implements([`${operationType}<${className}.Data, ${className}.Data, ${className}.Variables>`])
      .withBlock(block).string;
  }
}
