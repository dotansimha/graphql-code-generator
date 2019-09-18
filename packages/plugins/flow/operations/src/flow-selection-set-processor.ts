import { LinkField, PrimitiveField, PrimitiveAliasedFields, SelectionSetProcessorConfig, ProcessResult, BaseSelectionSetProcessor } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLObjectType, GraphQLInterfaceType } from 'graphql';

export interface FlowSelectionSetProcessorConfig extends SelectionSetProcessorConfig {
  useFlowExactObjects: boolean;
  useFlowReadOnlyTypes: boolean;
}

export class FlowWithPickSelectionSetProcessor extends BaseSelectionSetProcessor<FlowSelectionSetProcessorConfig> {
  transformAliasesPrimitiveFields(schemaType: GraphQLObjectType | GraphQLInterfaceType, fields: PrimitiveAliasedFields[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const useFlowExactObject = this.config.useFlowExactObjects;
    const useFlowReadOnlyTypes = this.config.useFlowReadOnlyTypes;
    const parentName = this.config.convertName(schemaType.name, { useTypesPrefix: true });

    return [`{${useFlowExactObject ? '|' : ''} ${fields.map(aliasedField => `${useFlowReadOnlyTypes ? '+' : ''}${aliasedField.alias}: $ElementType<${parentName}, '${aliasedField.fieldName}'>`).join(', ')} ${useFlowExactObject ? '|' : ''}}`];
  }

  transformLinkFields(fields: LinkField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const useFlowExactObject = this.config.useFlowExactObjects;
    const useFlowReadOnlyTypes = this.config.useFlowReadOnlyTypes;

    return [`{${useFlowExactObject ? '|' : ''} ${fields.map(field => `${useFlowReadOnlyTypes ? '+' : ''}${field.alias || field.name}: ${field.selectionSet}`).join(', ')} ${useFlowExactObject ? '|' : ''}}`];
  }

  transformPrimitiveFields(schemaType: GraphQLObjectType | GraphQLInterfaceType, fields: PrimitiveField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const useFlowExactObject = this.config.useFlowExactObjects;
    const useFlowReadOnlyTypes = this.config.useFlowReadOnlyTypes;
    const parentName = this.config.convertName(schemaType.name, { useTypesPrefix: true });

    return [`$Pick<${parentName}, {${useFlowExactObject ? '|' : ''} ${fields.map(fieldName => `${useFlowReadOnlyTypes ? '+' : ''}${fieldName}: *`).join(', ')} ${useFlowExactObject ? '|' : ''}}>`];
  }

  transformTypenameField(type: string, name: string): ProcessResult {
    return [`{ ${name}: ${type} }`];
  }
}
