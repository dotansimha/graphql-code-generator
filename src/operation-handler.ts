import {typeFromAST} from 'graphql/utilities/typeFromAST';
import {GraphQLSchema} from 'graphql/type/schema';
import {SelectionSetNode, SelectionNode, OperationDefinitionNode, VariableDefinitionNode} from 'graphql/language/ast';
import {getNamedType, GraphQLType, GraphQLObjectType} from 'graphql/type/definition';
import {FIELD, FRAGMENT_SPREAD, INLINE_FRAGMENT} from 'graphql/language/kinds';
import {CodegenDocument, Field, Model} from './interfaces';
import {getFieldDef, getTypeName, isArray, isRequired, isPrimitive} from './utils';
import pascalCase = require('pascal-case');
import {print} from 'graphql/language/printer';

const typesMap = {
  query: 'Query',
  subscription: 'Subscription',
  mutation: 'Mutation'
};

const buildName = (name: string, type: string): string => {
  return pascalCase(name) + typesMap[type];
};

const buildVariables = (schema: GraphQLSchema, definitionNode: OperationDefinitionNode, primitivesMap: any): Field[] => {
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

const handleNameDuplications = (name: string, existing: Model[]): string => {
  if (existing.find(model => model.name === name)) {
    return '_' + name;
  }

  return name;
};

export const buildInnerModelsArray = (schema: GraphQLSchema,
                                      rootObject: GraphQLType,
                                      selections: SelectionSetNode,
                                      primitivesMap: any,
                                      appendTo?: Model,
                                      result: Model[] = []): Model[] => {
  (selections ? selections.selections : []).forEach((selectionNode: SelectionNode) => {
    switch (selectionNode.kind) {
      case FIELD:
        const fieldName = selectionNode.name.value;
        const propertyName = selectionNode.alias ? selectionNode.alias.value : fieldName;
        const field = getFieldDef(rootObject, selectionNode);
        const rawType = field.type;
        const actualType = getNamedType(rawType);

        if (actualType instanceof GraphQLObjectType) {
          const modelName = handleNameDuplications(pascalCase(fieldName), result);
          let model = {
            name: modelName,
            fields: [],
            fragmentsUsed: [],
            inlineFragments: []
          };

          result.push(model);

          buildInnerModelsArray(schema, actualType, selectionNode.selectionSet, primitivesMap, model, result);

          if (!appendTo) {
            // Means we are on the root object, and we need to create the Result interface
            appendTo = {
              name: 'Result',
              fields: [],
              fragmentsUsed: [],
              inlineFragments: []
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
            type: getTypeName(primitivesMap, actualType),
            isArray: isArray(rawType),
            isRequired: isRequired(rawType)
          });
        }

        break;

      case FRAGMENT_SPREAD:
        const fragmentName = selectionNode.name.value;
        appendTo.fragmentsUsed.push(pascalCase(fragmentName));
        appendTo.usingFragments = appendTo.fragmentsUsed.length > 0;
        break;

      case INLINE_FRAGMENT:
        const root = typeFromAST(schema, selectionNode.typeCondition);
        const name = selectionNode.typeCondition.name.value + 'InlineFragment';

        let fragmentModel: Model = {
          name: name,
          fields: [],
          fragmentsUsed: [],
          inlineFragments: []
        };

        appendTo.inlineFragments.push({
          typeName: name,
          onModel: selectionNode.typeCondition.name.value,
        });

        appendTo.hasInlineFragments = appendTo.inlineFragments.length > 0;

        result.push(fragmentModel);
        buildInnerModelsArray(schema, root, selectionNode.selectionSet, primitivesMap, fragmentModel, result);

        break;

      default:
        break;
    }
  });

  return result;
};

export const getRoot = (schema: GraphQLSchema, operation: OperationDefinitionNode): GraphQLObjectType => {
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

export const handleOperation = (schema: GraphQLSchema, definitionNode: OperationDefinitionNode, primitivesMap: any): CodegenDocument => {
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
    imports: [],
    document: print(definitionNode)
  };

  document.variables = buildVariables(schema, definitionNode, primitivesMap);
  document.innerTypes = buildInnerModelsArray(schema, root, definitionNode.selectionSet, primitivesMap);

  document.hasVariables = document.variables.length > 0;
  document.hasInnerTypes = document.innerTypes.length > 0;

  document.variables.forEach((field: Field) => {
    if (field.type && !isPrimitive(primitivesMap, field.type)) {
      document.imports.push(field.type);
    }
  });

  return document;
};
