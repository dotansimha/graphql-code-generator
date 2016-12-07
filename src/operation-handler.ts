import {CodegenDocument, Field} from './interfaces';
import {OperationDefinitionNode} from "graphql/language/ast";
import {VariableDefinitionNode} from "graphql/language/ast";
import {typeFromAST} from "graphql/utilities/typeFromAST";
import {GraphQLSchema} from "graphql/type/schema";
import {getTypeName, isArray} from "./model-handler";
import * as toPascalCase from "pascal-case";

const typesMap = {
  query: 'Query',
  subscription: 'Subscription',
  mutation: 'Mutation'
};

const buildName = (name: string, type: string): string => {
  return toPascalCase(name) + typesMap[type];
};

const buildVariables = (schema: GraphQLSchema, definitionNode: OperationDefinitionNode): Field[] => {
  return definitionNode.variableDefinitions.map<Field>((variableDefinition: VariableDefinitionNode) => {
    const typeFromSchema = typeFromAST(schema, variableDefinition.type);

    return <Field>{
      name: variableDefinition.variable.name.value,
      type: getTypeName(typeFromSchema),
      isArray: isArray(typeFromSchema),
      isRequired: isArray(typeFromSchema)
    }
  });
};

const buildFields = (schema: GraphQLSchema, definitionNode: OperationDefinitionNode): Field[] => {
  console.log(definitionNode.selectionSet);
  return [];
};

export const handleOperation = (schema: GraphQLSchema, definitionNode: OperationDefinitionNode): CodegenDocument => {
  const name = definitionNode.name.value;
  const type = definitionNode.operation;

  let document: CodegenDocument = {
    name: buildName(name, type),
    rawName: name,
    isQuery: type === 'query',
    isSubscription: type === 'subscription',
    isMutation: type === 'mutation',
    variables: [],
    fields: [],
    hasVariables: false,
    hasFields: false
  };

  document.variables = buildVariables(schema, definitionNode);
  document.fields = buildFields(schema, definitionNode);
  document.hasVariables = document.variables.length > 0;
  document.hasFields = document.fields.length > 0;

  return document;
};
