import { FileOutput, MultiFileTemplates, Settings, GeneratorConfig } from './types';
import {
  Enum,
  Fragment,
  Interface,
  Operation,
  Scalar,
  SchemaTemplateContext,
  Type,
  Union,
  Document, debugLog
} from 'graphql-codegen-core';
import { sanitizeFilename } from './sanitizie-filename';
import { prepareSchemaForDocumentsOnly } from './prepare-documents-only';

const handlersMap = {
  type: handleType,
  inputType: handleInputType,
  union: handleUnion,
  'enum': handleEnum,
  scalar: handleScalar,
  'interface': handleInterface,
  operation: handleOperation,
  fragment: handleFragment,
  schema: handleSchema,
  documents: handleDocuments,
  all: handleAll,
};

export const ALLOWED_CUSTOM_TEMPLATE_EXT = [
  'template',
  'handlebars',
  'tmpl',
  'gqlgen'
];

function handleSchema(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleSchema] called`);

  return [{
    filename: prefixAndPath + '.' + (fileExtension || ''),
    content: compiledTemplate({
      ...schemaContext
    }),
  }];
}

function handleAll(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleAll] called`);

  return [{
    filename: prefixAndPath + '.' + (fileExtension || ''),
    content: compiledTemplate({
      ...schemaContext,
      operations: documents.operations,
      fragments: documents.fragments,
      hasFragments: documents.hasFragments,
      hasOperations: documents.hasOperations,
    }),
  }];
}

function handleDocuments(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleDocuments] called`);

  return [{
    filename: prefixAndPath + '.' + (fileExtension || ''),
    content: compiledTemplate({
      operations: documents.operations,
      fragments: documents.fragments,
      hasFragments: documents.hasFragments,
      hasOperations: documents.hasOperations,
    }),
  }];
}

function handleType(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleType] called`);

  return schemaContext.types.map((type: Type) => ({
    filename: (prefixAndPath === '' ? '' : prefixAndPath + '.') + sanitizeFilename(type.name, 'type') + '.' + (fileExtension || ''),
    content: compiledTemplate(type),
  }));
}

function handleInputType(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleInputType] called`);

  return schemaContext.inputTypes.map((type: Type) => ({
    filename: (prefixAndPath === '' ? '' : prefixAndPath + '.') + sanitizeFilename(type.name, 'input-type') + '.' + (fileExtension || ''),
    content: compiledTemplate(type),
  }));
}

function handleUnion(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleUnion] called`);

  return schemaContext.unions.map((union: Union) => ({
    filename: (prefixAndPath === '' ? '' : prefixAndPath + '.') + sanitizeFilename(union.name, 'union') + '.' + (fileExtension || ''),
    content: compiledTemplate(union),
  }));
}

function handleEnum(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleEnum] called`);

  return schemaContext.enums.map((en: Enum) => ({
    filename: (prefixAndPath === '' ? '' : prefixAndPath + '.') + sanitizeFilename(en.name, 'enum') + '.' + (fileExtension || ''),
    content: compiledTemplate(en),
  }));
}

function handleScalar(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleScalar] called`);

  return schemaContext.scalars.map((scalar: Scalar) => ({
    filename: (prefixAndPath === '' ? '' : prefixAndPath + '.') + sanitizeFilename(scalar.name, 'scalar') + '.' + (fileExtension || ''),
    content: compiledTemplate(scalar),
  }));
}

function handleInterface(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleInterface] called`);

  return schemaContext.interfaces.map((inf: Interface) => ({
    filename: (prefixAndPath === '' ? '' : prefixAndPath + '.') + sanitizeFilename(inf.name, 'interface') + '.' + (fileExtension || ''),
    content: compiledTemplate(inf),
  }));
}

function handleOperation(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleOperation] called`);

  return documents.operations.map((operation: Operation) => ({
    filename: (prefixAndPath === '' ? '' : prefixAndPath + '.') + sanitizeFilename(operation.name, operation.operationType) + '.' + (fileExtension || ''),
    content: compiledTemplate(operation),
  }));
}

function handleFragment(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  debugLog(`[handleFragment] called`);

  return documents.fragments.map((fragment: Fragment) => ({
    filename: (prefixAndPath === '' ? '' : prefixAndPath + '.') + sanitizeFilename(fragment.name, 'fragment') + '.' + (fileExtension || ''),
    content: compiledTemplate(fragment),
  }));
}

function parseTemplateName(templateName: string): { prefix: string; handler: Function; fileExtension: string; } {
  const splitted = (templateName || '').split('.');
  const templateExtension = splitted[splitted.length - 1];

  if (templateExtension && ALLOWED_CUSTOM_TEMPLATE_EXT.includes(templateExtension)) {
    const compilationContext = splitted[splitted.length - 2];
    const fileExtension = splitted[splitted.length - 3];
    const handler = handlersMap[compilationContext];

    if (handler) {
      return {
        prefix: splitted.slice(0, splitted.length - 3).join('.'),
        handler,
        fileExtension,
      };
    }
  }

  return null;
}

export function generateMultipleFiles(templates: MultiFileTemplates, executionSettings: Settings, config: GeneratorConfig, templateContext: SchemaTemplateContext, documents: Document): FileOutput[] {
  debugLog(`[generateMultipleFiles] Compiling multiple files...`);
  const result: FileOutput[] = [];
  const schemaContext = (!executionSettings.generateSchema) ? prepareSchemaForDocumentsOnly(templateContext) : templateContext;

  Object.keys(templates).forEach(templateName => {
    debugLog(`[generateMultipleFiles] Checking template: ${templateName}`);

    const templateFn = templates[templateName];

    if (handlersMap[templateName]) {
      debugLog(`[generateMultipleFiles] Using simple handle of type: ${templateName}`);

      const handler = handlersMap[templateName];

      result.push(...handler(templateFn, schemaContext, documents, config.filesExtension))
    } else {
      const parsedTemplateName = parseTemplateName(templateName);
      debugLog(`[generateMultipleFiles] Using custom template handlers, parsed template name result: `, parsedTemplateName);

      if (parsedTemplateName !== null) {
        result.push(...parsedTemplateName.handler(templateFn, schemaContext, documents, parsedTemplateName.fileExtension, parsedTemplateName.prefix))
      }
    }
  });

  return result;
}
