import {CodegenDocument, Field, Model} from './interfaces';
import {OperationDefinitionNode} from "graphql/language/ast";
import {VariableDefinitionNode} from "graphql/language/ast";
import {typeFromAST} from "graphql/utilities/typeFromAST";
import {GraphQLSchema} from "graphql/type/schema";
import {getTypeName, isArray} from "./model-handler";
import pascalCase = require("pascal-case");
import {GraphQLObjectType} from "graphql/type/definition";
import {SelectionSetNode} from "graphql/language/ast";
import {SelectionNode} from "graphql/language/ast";
import {FIELD} from "graphql/language/kinds";
import {FRAGMENT_SPREAD} from "graphql/language/kinds";
import {INLINE_FRAGMENT} from "graphql/language/kinds";
import {getFieldDef} from "./utils";
import {GraphQLOutputType} from "graphql/type/definition";
import {GraphQLField} from "graphql/type/definition";
import {GraphQLType} from "graphql/type/definition";
import {getNamedType} from "graphql/type/definition";
import {GraphQLNonNull} from "graphql/type/definition";

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
      isRequired: isArray(typeFromSchema)
    }
  });
};

const buildInnerModelsArray = (schema: GraphQLSchema, rootObject: GraphQLType, selections: SelectionSetNode, appendTo?: Model, result: Model[] = []): Model[] => {
  (selections ? selections.selections : []).forEach((selectionNode: SelectionNode) => {
    switch (selectionNode.kind) {
      case FIELD: {
        const fieldName = selectionNode.name.value;
        const propertyName = selectionNode.alias ? selectionNode.alias.value : fieldName;
        const field = getFieldDef(schema, rootObject, selectionNode);
        const actualType = getNamedType(field.type);

        if (actualType instanceof GraphQLObjectType) {
          let model = {
            name: pascalCase(fieldName),
            fields: []
          };

          buildInnerModelsArray(schema, actualType, selectionNode.selectionSet, model, result);

          result.push(model);
        }
        else {
          appendTo.fields.push({
            name: propertyName,
            type: getTypeName(actualType)
          });
        }

        break;
      }

      case FRAGMENT_SPREAD: {
        break;
      }

      case INLINE_FRAGMENT: {
        break;
      }

      default: {
        break;
      }
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

  let document: CodegenDocument = {
    name: buildName(name, type),
    rawName: name,
    isQuery: type === 'query',
    isSubscription: type === 'subscription',
    isMutation: type === 'mutation',
    variables: [],
    innerTypes: [],
    hasVariables: false,
    hasInnerTypes: false
  };

  document.variables = buildVariables(schema, definitionNode);
  document.innerTypes = buildInnerModelsArray(schema, root, definitionNode.selectionSet);
  document.hasVariables = document.variables.length > 0;
  document.hasInnerTypes = document.innerTypes.length > 0;

  return document;
};
