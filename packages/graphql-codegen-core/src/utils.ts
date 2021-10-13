import { Types } from '@graphql-codegen/plugin-helpers';
import { isDocumentNode } from '@graphql-tools/utils';
import { DocumentNode, GraphQLSchema, isSchema, Kind } from 'graphql';

export function shouldValidateDuplicateDocuments(
  skipDocumentsValidationOption: Types.GenerateOptions['skipDocumentsValidation']
) {
  // If the value is true, skip all
  if (skipDocumentsValidationOption === true) {
    return false;
  }
  // If the value is object with the specific flag, only skip this one
  if (typeof skipDocumentsValidationOption === 'object' && skipDocumentsValidationOption.skipDuplicateValidation) {
    return false;
  }
  // If the value is falsy or the specific flag is not set, validate
  return true;
}

export function shouldValidateDocumentsByRules(
  skipDocumentsValidationOption: Types.GenerateOptions['skipDocumentsValidation']
) {
  // If the value is true, skip all
  if (skipDocumentsValidationOption === true) {
    return false;
  }
  // If the value is object with the specific flag, only skip this one
  if (typeof skipDocumentsValidationOption === 'object' && skipDocumentsValidationOption.skipDocumentValidation) {
    return false;
  }
  // If the value is falsy or the specific flag is not set, validate
  return true;
}

export function getSkipDocumentsValidationOption(options: Types.GenerateOptions): Types.SkipDocumentsValidationOptions {
  // If the value is set on the root level
  if (options.skipDocumentsValidation) {
    return options.skipDocumentsValidation;
  }
  // If the value is set under `config` property
  if (typeof options.config === 'object' && options.config?.skipDocumentsValidation) {
    return options.config.skipDocumentsValidation;
  }
  return false;
}

export function hasFederationSpec(schemaOrAST: GraphQLSchema | DocumentNode) {
  if (isSchema(schemaOrAST)) {
    return (
      schemaOrAST.getDirective('external') ||
      schemaOrAST.getDirective('requires') ||
      schemaOrAST.getDirective('provides') ||
      schemaOrAST.getDirective('key')
    );
  } else if (isDocumentNode(schemaOrAST)) {
    return schemaOrAST.definitions.some(
      def =>
        def.kind === Kind.DIRECTIVE_DEFINITION &&
        (def.name.value === 'external' ||
          def.name.value === 'requires' ||
          def.name.value === 'provides' ||
          def.name.value === 'key')
    );
  }
  return false;
}
