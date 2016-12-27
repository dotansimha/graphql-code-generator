import {typeFromAST} from 'graphql/utilities/typeFromAST';
import {GraphQLSchema} from 'graphql/type/schema';
import {OperationDefinitionNode, VariableDefinitionNode} from 'graphql/language/ast';
import {CodegenDocument, Field} from './interfaces';
import {
  getTypeName, isArray, isRequired, isPrimitive, getRoot,
  buildName
} from './utils';
import pascalCase = require('pascal-case');
import {print} from 'graphql/language/printer';
import {buildInnerModelsArray} from './inner-models-builer';

export const buildVariables = (schema: GraphQLSchema, definitionNode: OperationDefinitionNode, primitivesMap: any): Field[] => {
  return definitionNode.variableDefinitions.map<Field>((variableDefinition: VariableDefinitionNode) => {
    const typeFromSchema = typeFromAST(schema, variableDefinition.type);

    return <Field>{
      name: variableDefinition.variable.name.value,
      type: getTypeName(primitivesMap, typeFromSchema),
      isArray: isArray(typeFromSchema),
      isRequired: isRequired(typeFromSchema)
    };
  });
};

export const handleOperation = (schema: GraphQLSchema, definitionNode: OperationDefinitionNode, primitivesMap: any, flattenInnerTypes: boolean): CodegenDocument => {
  const name = definitionNode.name.value;
  const type = definitionNode.operation;
  const root = getRoot(schema, definitionNode);
  const typesMap = {
    query: schema.getQueryType().name,
    subscription: schema.getSubscriptionType().name,
    mutation: schema.getMutationType().name,
  };
  const builtName = buildName(typesMap, name, type);

  let document: CodegenDocument = {
    name: builtName,
    rawName: name,
    isQuery: type === 'query',
    isSubscription: type === 'subscription',
    isMutation: type === 'mutation',
    isFragment: false,
    variables: [],
    innerTypes: [],
    hasVariables: false,
    hasInnerTypes: false,
    rootType: [],
    imports: [],
    document: print(definitionNode)
  };

  document.variables = buildVariables(schema, definitionNode, primitivesMap);
  document.innerTypes = buildInnerModelsArray(schema, root, flattenInnerTypes, definitionNode.selectionSet, primitivesMap);
  document.rootType = [document.innerTypes.find(i => i.isRoot)];

  document.hasVariables = document.variables.length > 0;
  document.hasInnerTypes = document.innerTypes.length > 0;

  document.variables.forEach((field: Field) => {
    if (field.type && !isPrimitive(primitivesMap, field.type)) {
      document.imports.push(field.type);
    }
  });

  return document;
};
