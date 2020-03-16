import {
  LinkField,
  PrimitiveField,
  PrimitiveAliasedFields,
  SelectionSetProcessorConfig,
  ProcessResult,
  BaseSelectionSetProcessor,
  indent,
} from '@graphql-codegen/visitor-plugin-common';
import { GraphQLObjectType, GraphQLInterfaceType } from 'graphql';

export interface FlowSelectionSetProcessorConfig extends SelectionSetProcessorConfig {
  useFlowExactObjects: boolean;
  useFlowReadOnlyTypes: boolean;
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
    const useFlowReadOnlyTypes = this.config.useFlowReadOnlyTypes;
    const parentName =
      (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
      this.config.convertName(schemaType.name, {
        useTypesPrefix: true,
      });

    return [
      `{${useFlowExactObject ? '|' : ''} ${fields
        .map(
          aliasedField =>
            `${useFlowReadOnlyTypes ? '+' : ''}${aliasedField.alias}: $ElementType<${parentName}, '${
              aliasedField.fieldName
            }'>`
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
    } else if (pieces.length === 1) {
      return pieces[0];
    } else {
      return `({\n  ${pieces.map(t => indent(`...${t}`)).join(`,\n`)}\n})`;
    }
  }

  transformLinkFields(fields: LinkField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const useFlowExactObject = this.config.useFlowExactObjects;
    const useFlowReadOnlyTypes = this.config.useFlowReadOnlyTypes;

    return [
      `{${useFlowExactObject ? '|' : ''} ${fields
        .map(field => `${useFlowReadOnlyTypes ? '+' : ''}${field.alias || field.name}: ${field.selectionSet}`)
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
    const useFlowReadOnlyTypes = this.config.useFlowReadOnlyTypes;
    const parentName =
      (this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '') +
      this.config.convertName(schemaType.name, {
        useTypesPrefix: true,
      });

    return [
      `$Pick<${parentName}, {${useFlowExactObject ? '|' : ''} ${fields
        .map(fieldName => `${useFlowReadOnlyTypes ? '+' : ''}${fieldName}: *`)
        .join(', ')} ${useFlowExactObject ? '|' : ''}}>`,
    ];
  }

  transformTypenameField(type: string, name: string): ProcessResult {
    return [`{ ${name}: ${type} }`];
  }
}
