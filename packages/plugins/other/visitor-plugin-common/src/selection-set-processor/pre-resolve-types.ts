import { getBaseType, removeNonNullWrapper } from '@graphql-codegen/plugin-helpers';
import { GraphQLInterfaceType, GraphQLObjectType, isEnumType, isNonNullType } from 'graphql';
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

    const x = fields.map(field => {
      const fieldObj = schemaType.getFields()[field.fieldName];

      const baseType = getBaseType(fieldObj.type);
      let typeToUse = baseType.name;

      const useInnerType = field.isConditional && isNonNullType(fieldObj.type);
      const innerType = useInnerType ? removeNonNullWrapper(fieldObj.type) : undefined;

      const name = this.config.formatNamedField(
        field.fieldName,
        useInnerType ? innerType : fieldObj.type,
        field.isConditional,
        unsetTypes
      );

      if (unsetTypes) {
        return {
          name,
          type: 'never',
        };
      }

      if (isEnumType(baseType)) {
        typeToUse =
          (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
          this.config.convertName(baseType.name, { useTypesPrefix: this.config.enumPrefix });
      } else if (this.config.scalars[baseType.name]) {
        typeToUse = this.config.scalars[baseType.name];
      }

      const wrappedType = this.config.wrapTypeWithModifiers(typeToUse, fieldObj.type);

      return {
        name,
        type: wrappedType,
      };
    });
    return x;
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
        const name = this.config.formatNamedField(aliasedField.alias, null);
        return {
          name,
          type: `'${schemaType.name}'`,
        };
      }
      const fieldObj = schemaType.getFields()[aliasedField.fieldName];
      const baseType = getBaseType(fieldObj.type);
      let typeToUse = this.config.scalars[baseType.name] || baseType.name;

      if (isEnumType(baseType)) {
        typeToUse =
          (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
          this.config.convertName(baseType.name, { useTypesPrefix: this.config.enumPrefix });
      }

      const name = this.config.formatNamedField(aliasedField.alias, fieldObj.type, undefined, unsetTypes);
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
