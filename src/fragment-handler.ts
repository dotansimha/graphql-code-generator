import {GraphQLSchema} from 'graphql/type/schema';
import {FragmentDefinitionNode} from 'graphql/language/ast';
import {Model, CodegenDocument} from './interfaces';
import pascalCase = require('pascal-case');
import {buildInnerModelsArray} from './operation-handler';
import {typeFromAST} from 'graphql/utilities/typeFromAST';

export const handleFragment = (schema: GraphQLSchema, fragmentNode: FragmentDefinitionNode, primitivesMap: any): CodegenDocument => {
  const rawName = fragmentNode.name.value;
  const fragmentName = pascalCase(rawName);

  let result: CodegenDocument = {
    name: fragmentName,
    rawName: rawName,
    isQuery: false,
    isSubscription: false,
    isMutation: false,
    isFragment: true,
    innerTypes: [],
    hasInnerTypes: false,
    variables: [],
    hasVariables: false
  };

  let appendTo: Model = {
    name: 'Fragment',
    fields: [],
    isObject: true,
    isFragment: true,
    fragmentsUsed: []
  };

  const root = typeFromAST(schema, fragmentNode.typeCondition);
  result.innerTypes = [appendTo, ...buildInnerModelsArray(schema, root, fragmentNode.selectionSet, primitivesMap, appendTo)];
  result.hasInnerTypes = result.innerTypes.length > 0;

  return result;
};
