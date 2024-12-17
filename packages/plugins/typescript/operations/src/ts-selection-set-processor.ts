import {
  BaseSelectionSetProcessor,
  LinkField,
  PrimitiveAliasedFields,
  PrimitiveField,
  ProcessResult,
  SelectionSetProcessorConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { GraphQLInterfaceType, GraphQLObjectType } from 'graphql';

export class TypeScriptSelectionSetProcessor extends BaseSelectionSetProcessor<SelectionSetProcessorConfig> {
  transformPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveField[],
    unsetTypes?: boolean
  ): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const parentName =
      (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
      this.config.convertName(schemaType.name, {
        useTypesPrefix: true,
      });

    if (unsetTypes) {
      const escapedFieldNames = fields.map(field => `'${field.fieldName}'`);
      return [formattedUnionTransform(this.config, 'MakeEmpty', parentName, escapedFieldNames)];
    }

    let hasConditionals = false;
    const escapedConditionalsList: string[] = [];
    const escapedFieldNames = fields.map(field => {
      if (field.isConditional) {
        hasConditionals = true;
        escapedConditionalsList.push(`'${field.fieldName}'`);
      }
      return `'${field.fieldName}'`;
    });
    let resString = formattedUnionTransform(this.config, 'Pick', parentName, escapedFieldNames);

    if (hasConditionals) {
      const avoidOptional =
        // TODO: check type and exec only if relevant
        this.config.avoidOptionals === true ||
        (typeof this.config.avoidOptionals === 'object' &&
          (this.config.avoidOptionals.field ||
            this.config.avoidOptionals.inputValue ||
            this.config.avoidOptionals.object));

      const transform = avoidOptional ? 'MakeMaybe' : 'MakeOptional';
      resString = `${
        this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : ''
      }${formattedUnionTransform(this.config, transform, resString, escapedConditionalsList)}`;
    }
    return [resString];
  }

  transformTypenameField(type: string, name: string): ProcessResult {
    return [`{ ${name}: ${type} }`];
  }

  transformAliasesPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveAliasedFields[]
  ): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const parentName =
      (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
      this.config.convertName(schemaType.name, {
        useTypesPrefix: true,
      });

    const selections = fields.map(aliasedField => {
      const value =
        aliasedField.fieldName === '__typename' ? `'${schemaType.name}'` : `${parentName}['${aliasedField.fieldName}']`;

      return `${aliasedField.alias}: ${value}`;
    });
    return [formatSelections(this.config, selections)];
  }

  transformLinkFields(fields: LinkField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const selections = fields.map(field => `${field.alias || field.name}: ${field.selectionSet}`);

    return [formatSelections(this.config, selections)];
  }
}

/** Equivalent to `${transformName}<${target}, ${unionElements.join(' | ')}>`, but with line feeds if necessary */
function formattedUnionTransform(
  config: SelectionSetProcessorConfig,
  transformName: string,
  target: string,
  unionElements: string[]
): string {
  if (config.printFieldsOnNewLines && unionElements.length > 3) {
    return `${transformName}<\n    ${target},\n    | ${unionElements.join('\n    | ')}\n  >`;
  }
  return `${transformName}<${target}, ${unionElements.join(' | ')}>`;
}

/** Equivalent to `{ ${selections.join(', ')} }`, but with line feeds if necessary */
function formatSelections(config: SelectionSetProcessorConfig, selections: string[]): string {
  if (config.printFieldsOnNewLines && selections.length > 1) {
    return `{\n    ${selections.join(',\n    ')},\n  }`;
  }
  return `{ ${selections.join(', ')} }`;
}
