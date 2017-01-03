import {getNamedType, GraphQLType, GraphQLObjectType, GraphQLInterfaceType} from 'graphql/type/definition';
import {FIELD, FRAGMENT_SPREAD, INLINE_FRAGMENT} from 'graphql/language/kinds';
import {SelectionSetNode, SelectionNode} from 'graphql/language/ast';
import {GraphQLSchema} from 'graphql/type/schema';
import {Model} from '../models/interfaces';
import {getFieldDef, handleNameDuplications, isArray, isRequired, getTypeName} from '../utils/utils';
import pascalCase = require('pascal-case');
import camelCase = require('camel-case');
import {typeFromAST} from 'graphql/utilities/typeFromAST';

export const buildInnerModelsArray = (schema: GraphQLSchema,
                                      rootObject: GraphQLType,
                                      flattenInnerTypes: boolean,
                                      selections: SelectionSetNode,
                                      primitivesMap: any,
                                      appendTo?: Model,
                                      result: Model[] = []): Model[] => {
  (selections ? selections.selections : []).forEach((selectionNode: SelectionNode) => {
    switch (selectionNode.kind) {
      case FIELD:
        let isAliased = false;
        const fieldName = selectionNode.name.value;
        let propertyName = fieldName;

        if (selectionNode.alias && selectionNode.alias.value) {
          isAliased = true;
          propertyName = selectionNode.alias.value;
        }

        const field = getFieldDef(rootObject, selectionNode);
        const rawType = field.type;
        const actualType = getNamedType(rawType);

        if (actualType instanceof GraphQLObjectType || actualType instanceof GraphQLInterfaceType) {
          const modelName = handleNameDuplications(pascalCase(fieldName), result);

          if (!appendTo) {
            // Means we are on the root object, and we need to create the root interface result
            appendTo = {
              isRoot: true,
              name: fieldName,
              fields: [],
              fragmentsUsed: [],
              inlineFragments: [],
              innerTypes: []
            };

            result.push(appendTo);
          }

          appendTo.fields.push({
            name: propertyName,
            schemaFieldName: fieldName,
            type: isAliased ? pascalCase(propertyName) + '_' + modelName : modelName,
            isAliased: isAliased,
            isArray: isArray(rawType),
            isRequired: isRequired(rawType)
          });

          let model: Model = {
            name: isAliased ? pascalCase(propertyName) + '_' + modelName : modelName,
            fields: [],
            fragmentsUsed: [],
            inlineFragments: [],
            schemaTypeName: String(actualType)
          };

          let resultArr = result;

          if (!flattenInnerTypes) {
            appendTo.innerTypes = resultArr = appendTo.innerTypes || [];
            resultArr.push(model);
          }
          else {
            result.push(model);
          }

          buildInnerModelsArray(schema, actualType, flattenInnerTypes, selectionNode.selectionSet, primitivesMap, model, resultArr);
        }
        else {
          appendTo.fields.push({
            name: propertyName,
            isAliased: isAliased,
            schemaFieldName: fieldName,
            type: getTypeName(primitivesMap, actualType),
            isArray: isArray(rawType),
            isRequired: isRequired(rawType)
          });
        }

        break;

      case FRAGMENT_SPREAD:
        const fragmentName = selectionNode.name.value;

        appendTo.fragmentsUsed.push({
          fieldName: camelCase(fragmentName),
          typeName: pascalCase(fragmentName)
        });

        appendTo.usingFragments = appendTo.fragmentsUsed.length > 0;
        break;

      case INLINE_FRAGMENT:
        const root = typeFromAST(schema, selectionNode.typeCondition);
        const schemaTypeName = selectionNode.typeCondition.name.value;
        const name = schemaTypeName + 'InlineFragment';

        let fragmentModel: Model = {
          name: name,
          fields: [],
          fragmentsUsed: [],
          inlineFragments: [],
          isInlineFragment: true,
          schemaTypeName: schemaTypeName
        };

        appendTo.inlineFragments.push({
          typeName: schemaTypeName,
          onModel: selectionNode.typeCondition.name.value,
        });

        appendTo.hasInlineFragments = appendTo.inlineFragments.length > 0;

        let resultArr = result;

        if (!flattenInnerTypes) {
          appendTo.innerTypes = resultArr = appendTo.innerTypes || [];
          resultArr.push(fragmentModel);
        }
        else {
          result.push(fragmentModel);
        }

        buildInnerModelsArray(schema, root, flattenInnerTypes, selectionNode.selectionSet, primitivesMap, fragmentModel, resultArr);

        break;

      default:
        break;
    }
  });

  return result;
};
