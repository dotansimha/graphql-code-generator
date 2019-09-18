import { BaseSelectionSetProcessor, ProcessResult, LinkField, PrimitiveAliasedFields, PrimitiveField, SelectionSetProcessorConfig } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLObjectType, GraphQLInterfaceType } from 'graphql';

export class TypeScriptSelectionSetProcessor extends BaseSelectionSetProcessor<SelectionSetProcessorConfig> {
  transformPrimitiveFields(schemaType: GraphQLObjectType | GraphQLInterfaceType, fields: PrimitiveField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const parentName =
      (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
      this.config.convertName(schemaType.name, {
        useTypesPrefix: true,
      });

    return [`Pick<${parentName}, ${fields.map(field => `'${field}'`).join(' | ')}>`];
  }

  transformTypenameField(type: string, name: string): ProcessResult {
    return [`{ ${name}: ${type} }`];
  }

  transformAliasesPrimitiveFields(schemaType: GraphQLObjectType | GraphQLInterfaceType, fields: PrimitiveAliasedFields[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const parentName =
      (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
      this.config.convertName(schemaType.name, {
        useTypesPrefix: true,
      });

    return [
      `{ ${fields
        .map(aliasedField => {
          const value = aliasedField.fieldName === '__typename' ? `'${schemaType.name}'` : `${parentName}['${aliasedField.fieldName}']`;

          return `${this.config.formatNamedField(aliasedField.alias)}: ${value}`;
        })
        .join(', ')} }`,
    ];
  }

  transformLinkFields(fields: LinkField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    return [`{ ${fields.map(field => `${this.config.formatNamedField(field.alias || field.name)}: ${field.selectionSet}`).join(', ')} }`];
  }
}
