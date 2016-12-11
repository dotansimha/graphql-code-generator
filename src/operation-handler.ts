import {typeFromAST} from 'graphql/utilities/typeFromAST';
import {GraphQLSchema} from 'graphql/type/schema';
import {SelectionSetNode, SelectionNode, OperationDefinitionNode, VariableDefinitionNode} from 'graphql/language/ast';
import {getNamedType, GraphQLType, GraphQLObjectType} from 'graphql/type/definition';
import {FIELD, FRAGMENT_SPREAD, INLINE_FRAGMENT} from 'graphql/language/kinds';
import {CodegenDocument, Field, Model} from './interfaces';
import {getTypeName, isArray, isRequired} from './model-handler';
import {getFieldDef} from './utils';
import pascalCase = require('pascal-case');

const typesMap = {
  query: 'Query',
  subscription: 'Subscription',
  mutation: 'Mutation'
};

const buildName = (name: string, type: string): string => {
  return pascalCase(name) + typesMap[type];
};

const buildVariables = (schema: GraphQLSchema, definitionNode: OperationDefinitionNode): Field[] => {
  return definitionNode.variableDefinitions.map<Field>((variableDefinition: VariableDefinitionNode) => {
    const typeFromSchema = typeFromAST(schema, variableDefinition.type);

    return <Field>{
      name: variableDefinition.variable.name.value,
      type: getTypeName(typeFromSchema),
      isArray: isArray(typeFromSchema),
      isRequired: isRequired(typeFromSchema)
    };
  });
};

const handleNameDuplications = (name: string, existing: Model[]): string => {
  if (existing.find(model => model.name === name)) {
    return '_' + name;
  }

  return name;
};

export const buildInnerModelsArray = (schema: GraphQLSchema,
                                      rootObject: GraphQLType,
                                      selections: SelectionSetNode,
                                      appendTo?: Model,
                                      result: Model[] = []): Model[] => {
  (selections ? selections.selections : []).forEach((selectionNode: SelectionNode) => {
    switch (selectionNode.kind) {
      case FIELD:
        const fieldName = selectionNode.name.value;
        const propertyName = selectionNode.alias ? selectionNode.alias.value : fieldName;
        const field = getFieldDef(schema, rootObject, selectionNode);
        const rawType = field.type;
        const actualType = getNamedType(rawType);

        if (actualType instanceof GraphQLObjectType) {
          const modelName = handleNameDuplications(pascalCase(fieldName), result);
          let model = {
            name: modelName,
            fields: [],
            fragmentsUsed: []
          };

          result.push(model);

          buildInnerModelsArray(schema, actualType, selectionNode.selectionSet, model, result);

          if (!appendTo) {
            // Means we are on the root object, and we need to create the Result interface
            appendTo = {
              name: 'Result',
              fields: [],
              fragmentsUsed: []
            };

            result.push(appendTo);
          }

          appendTo.fields.push({
            name: propertyName,
            type: modelName,
            isArray: isArray(rawType),
            isRequired: isRequired(rawType)
          });
        }
        else {
          appendTo.fields.push({
            name: propertyName,
            type: getTypeName(actualType),
            isArray: isArray(rawType),
            isRequired: isRequired(rawType)
          });
        }

        break;

      case FRAGMENT_SPREAD:
        const fragmentName = selectionNode.name.value;
        appendTo.fragmentsUsed.push(pascalCase(fragmentName) + '.Fragment');
        appendTo.usingFragments = appendTo.fragmentsUsed.length > 0;
        break;

      case INLINE_FRAGMENT:
        // TODO: Handle this
        break;

      default:
        break;
    }
  });

  return result;
};

const getRoot = (schema: GraphQLSchema, operation: OperationDefinitionNode): GraphQLObjectType => {
  switch (operation.operation) {
    case 'query':
      return schema.getQueryType();
    case 'mutation':
      return schema.getMutationType();
    case 'subscription':
      return schema.getSubscriptionType();
    default:
      return;
  }
};

export const handleOperation = (schema: GraphQLSchema, definitionNode: OperationDefinitionNode): CodegenDocument => {
  const name = definitionNode.name.value;
  const type = definitionNode.operation;
  const root = getRoot(schema, definitionNode);
  const builtName = buildName(name, type);

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
  };

  document.variables = buildVariables(schema, definitionNode);
  document.innerTypes = buildInnerModelsArray(schema, root, definitionNode.selectionSet);

  document.hasVariables = document.variables.length > 0;
  document.hasInnerTypes = document.innerTypes.length > 0;

  return document;
};
