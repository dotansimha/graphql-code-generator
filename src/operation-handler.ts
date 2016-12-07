import {CodegenDocument, Field} from './interfaces';
import {OperationDefinitionNode} from "graphql/language/ast";
import {VariableDefinitionNode} from "graphql/language/ast";
import {typeFromAST} from "graphql/utilities/typeFromAST";
import {GraphQLSchema} from "graphql/type/schema";
import {getTypeName, isArray} from "./model-handler";

const typesMap = {
  query: 'Query',
  subscription: 'Subscription',
  mutation: 'Mutation'
};

const buildName = (name: string, type: string): string => {
  return name + typesMap[type];
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
    fields: []
  };

  document.variables = buildVariables(schema, definitionNode);

  return document;
};
