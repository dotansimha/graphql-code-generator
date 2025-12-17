import { getBaseType } from '@graphql-codegen/plugin-helpers';
import { GraphQLInterfaceType, GraphQLObjectType, isEnumType } from 'graphql';
import {
  BaseSelectionSetProcessor,
  LinkField,
  PrimitiveAliasedFields,
  PrimitiveField,
  ProcessResult,
  SelectionSetProcessorConfig,
} from './base.js';

export class PreResolveTypesProcessor extends BaseSelectionSetProcessor<SelectionSetProcessorConfig> {
  transformTypenameField(type: string, name: string): ProcessResult {
    return [
      {
        type,
        name,
      },
    ];
  }

  transformPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveField[],
    unsetTypes?: boolean
  ): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    return fields.map(field => {
      const fieldObj = schemaType.getFields()[field.fieldName];

      const baseType = getBaseType(fieldObj.type);
      let typeToUse = baseType.name;

      const name = this.config.formatNamedField({
        name: field.fieldName,
        isOptional: field.isConditional || unsetTypes,
      });

      if (unsetTypes) {
        return {
          name,
          type: 'never',
        };
      }

      if (isEnumType(baseType)) {
        typeToUse =
          (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
          this.config.convertName(baseType.name, {
            useTypesPrefix: this.config.enumPrefix,
            useTypesSuffix: this.config.enumSuffix,
          });
      } else if (this.config.scalars[baseType.name]) {
        typeToUse = this.config.scalars[baseType.name].output;
      }

      const wrappedType = this.config.wrapTypeWithModifiers(typeToUse, fieldObj.type);

      return {
        name,
        type: wrappedType,
      };
    });
  }

  transformAliasesPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveAliasedFields[],
    unsetTypes?: boolean
  ): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    return fields.map(aliasedField => {
      if (aliasedField.fieldName === '__typename') {
        const name = this.config.formatNamedField({ name: aliasedField.alias });
        return {
          name,
          type: `'${schemaType.name}'`,
        };
      }
      const fieldObj = schemaType.getFields()[aliasedField.fieldName];
      const baseType = getBaseType(fieldObj.type);
      let typeToUse = this.config.scalars[baseType.name]?.output || baseType.name;

      if (isEnumType(baseType)) {
        typeToUse =
          (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
          this.config.convertName(baseType.name, {
            useTypesPrefix: this.config.enumPrefix,
            useTypesSuffix: this.config.enumSuffix,
          });
      }

      const name = this.config.formatNamedField({
        name: aliasedField.alias,
        isOptional: aliasedField.isConditional || unsetTypes,
      });
      if (unsetTypes) {
        return {
          type: 'never',
          name,
        };
      }

      const wrappedType = this.config.wrapTypeWithModifiers(typeToUse, fieldObj.type);

      return {
        name,
        type: wrappedType,
      };
    });
  }

  transformLinkFields(fields: LinkField[], unsetTypes?: boolean): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    return fields.map(field => ({
      name: field.alias || field.name,
      type: unsetTypes ? 'never' : field.selectionSet,
    }));
  }
}
