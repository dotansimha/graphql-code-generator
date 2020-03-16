import {
  BaseSelectionSetProcessor,
  ProcessResult,
  LinkField,
  PrimitiveAliasedFields,
  PrimitiveField,
  SelectionSetProcessorConfig,
} from './base';
import { GraphQLObjectType, GraphQLInterfaceType, isEnumType } from 'graphql';
import { getBaseType } from '@graphql-codegen/plugin-helpers';

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
    fields: PrimitiveField[]
  ): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    return fields.map(field => {
      const fieldObj = schemaType.getFields()[field];
      const baseType = getBaseType(fieldObj.type);
      let typeToUse = baseType.name;

      if (isEnumType(baseType)) {
        typeToUse =
          (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
          this.config.convertName(baseType.name, { useTypesPrefix: this.config.enumPrefix });
      } else if (this.config.scalars[baseType.name]) {
        typeToUse = this.config.scalars[baseType.name];
      }

      const name = this.config.formatNamedField(field, fieldObj.type);
      const wrappedType = this.config.wrapTypeWithModifiers(typeToUse, fieldObj.type);

      return {
        name,
        type: wrappedType,
      };
    });
  }

  transformAliasesPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveAliasedFields[]
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
      } else {
        const fieldObj = schemaType.getFields()[aliasedField.fieldName];
        const baseType = getBaseType(fieldObj.type);
        let typeToUse = this.config.scalars[baseType.name] || baseType.name;

        if (isEnumType(baseType)) {
          typeToUse =
            (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
            this.config.convertName(baseType.name, { useTypesPrefix: this.config.enumPrefix });
        }

        const name = this.config.formatNamedField(aliasedField.alias, fieldObj.type);
        const wrappedType = this.config.wrapTypeWithModifiers(typeToUse, fieldObj.type);

        return {
          name,
          type: wrappedType,
        };
      }
    });
  }

  transformLinkFields(fields: LinkField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    return fields.map(field => ({
      name: field.alias || field.name,
      type: field.selectionSet,
    }));
  }
}
