import {getNamedType, GraphQLType, GraphQLObjectType} from 'graphql/type/definition';
import {FIELD, FRAGMENT_SPREAD, INLINE_FRAGMENT} from 'graphql/language/kinds';
import {SelectionSetNode, SelectionNode} from 'graphql/language/ast';
import {GraphQLSchema} from 'graphql/type/schema';
import {Model} from './interfaces';
import {getFieldDef, handleNameDuplications, isArray, isRequired, getTypeName} from './utils';
import pascalCase = require('pascal-case');
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
        const fieldName = selectionNode.name.value;
        const propertyName = selectionNode.alias ? selectionNode.alias.value : fieldName;
        const field = getFieldDef(rootObject, selectionNode);
        const rawType = field.type;
        const actualType = getNamedType(rawType);

        if (actualType instanceof GraphQLObjectType) {
          const modelName = handleNameDuplications(pascalCase(fieldName), result);
          let model: Model = {
            name: modelName,
            fields: [],
            fragmentsUsed: [],
            inlineFragments: [],
            schemaTypeName: String(actualType)
          };

          result.push(model);

          let resultArr = result;

          if (!flattenInnerTypes) {
            model.innerTypes = resultArr = [];
          }

          buildInnerModelsArray(schema, actualType, flattenInnerTypes, selectionNode.selectionSet, primitivesMap, model, resultArr);

          if (!appendTo) {
            // Means we are on the root object, and we need to create the Result interface
            appendTo = {
              isRoot: true,
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
        const schemaTypeName = selectionNode.typeCondition.name.value;
        const name = schemaTypeName + 'InlineFragment';

        let fragmentModel: Model = {
          name: name,
          fields: [],
          fragmentsUsed: [],
          inlineFragments: [],
          schemaTypeName: schemaTypeName
        };

        appendTo.inlineFragments.push({
          typeName: name,
          onModel: selectionNode.typeCondition.name.value,
        });

        appendTo.hasInlineFragments = appendTo.inlineFragments.length > 0;

        result.push(fragmentModel);

        let resultArr = result;

        if (!flattenInnerTypes) {
          fragmentModel.innerTypes = resultArr = [];
        }

        buildInnerModelsArray(schema, root, flattenInnerTypes, selectionNode.selectionSet, primitivesMap, fragmentModel, resultArr);

        break;

      default:
        break;
    }
  });

  return result;
};
