import {
  LinkField,
  PrimitiveAliasedFields,
  SelectionSetProcessorConfig,
  ProcessResult,
  BaseSelectionSetProcessor,
  indent,
  PrimitiveField,
} from '@graphql-codegen/visitor-plugin-common';
import { GraphQLObjectType, GraphQLInterfaceType } from 'graphql';

export interface FlowSelectionSetProcessorConfig extends SelectionSetProcessorConfig {
  useFlowExactObjects: boolean;
}

export class FlowWithPickSelectionSetProcessor extends BaseSelectionSetProcessor<FlowSelectionSetProcessorConfig> {
  transformAliasesPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveAliasedFields[]
  ): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const useFlowExactObject = this.config.useFlowExactObjects;
    const { formatNamedField } = this.config;
    const fieldObj = schemaType.getFields();
    const parentName =
      (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
      this.config.convertName(schemaType.name, {
        useTypesPrefix: true,
      });

    return [
      `{${useFlowExactObject ? '|' : ''} ${fields
        .map(
          aliasedField =>
            `${formatNamedField(
              aliasedField.alias,
              fieldObj[aliasedField.fieldName].type
            )}: $ElementType<${parentName}, '${aliasedField.fieldName}'>`
        )
        .join(', ')} ${useFlowExactObject ? '|' : ''}}`,
    ];
  }

  buildFieldsIntoObject(allObjectsMerged: string[]): string {
    return `...{ ${allObjectsMerged.join(', ')} }`;
  }

  buildSelectionSetFromStrings(pieces: string[]): string {
    if (pieces.length === 0) {
      return null;
    }
    if (pieces.length === 1) {
      return pieces[0];
    }
    return `({\n  ${pieces.map(t => indent(`...${t}`)).join(`,\n`)}\n})`;
  }

  transformLinkFields(fields: LinkField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const useFlowExactObject = this.config.useFlowExactObjects;
    return [
      `{${useFlowExactObject ? '|' : ''} ${fields
        .map(field => `${field.alias || field.name}: ${field.selectionSet}`)
        .join(', ')} ${useFlowExactObject ? '|' : ''}}`,
    ];
  }

  transformPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveField[]
  ): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const useFlowExactObject = this.config.useFlowExactObjects;
    const { formatNamedField } = this.config;
    const parentName =
      (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
      this.config.convertName(schemaType.name, {
        useTypesPrefix: true,
      });
    const fieldObj = schemaType.getFields();
    let hasConditionals = false;
    const conditilnalsList: string[] = [];
    let resString = `$Pick<${parentName}, {${useFlowExactObject ? '|' : ''} ${fields
      .map(field => {
        if (field.isConditional) {
          hasConditionals = true;
          conditilnalsList.push(field.fieldName);
        }
        return `${formatNamedField(field.fieldName, fieldObj[field.fieldName].type)}: *`;
      })
      .join(', ')} ${useFlowExactObject ? '|' : ''}}>`;
    if (hasConditionals) {
      resString = `$MakeOptional<${resString}, ${conditilnalsList.map(field => `{ ${field}: * }`).join(' | ')}>`;
    }
    return [resString];
  }

  transformTypenameField(type: string, name: string): ProcessResult {
    const useFlowExactObject = this.config.useFlowExactObjects;

    return [`{${useFlowExactObject ? "|" : ""} ${name}: ${type} } ${useFlowExactObject ? "|" : ""}`];
  }
}
