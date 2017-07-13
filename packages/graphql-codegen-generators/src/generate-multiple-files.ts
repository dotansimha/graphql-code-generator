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
  Document
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
  return [{
    filename: prefixAndPath + sanitizeFilename('', 'schema') + '.' + (fileExtension || ''),
    content: compiledTemplate({
      schema: schemaContext
    }),
  }];
}

function handleAll(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  return [{
    filename: prefixAndPath + sanitizeFilename('', 'all') + '.' + (fileExtension || ''),
    content: compiledTemplate({
      schema: schemaContext,
      documents
    }),
  }];
}

function handleDocuments(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  return [{
    filename: prefixAndPath + sanitizeFilename('', 'documents') + '.' + (fileExtension || ''),
    content: compiledTemplate({
      documents,
    }),
  }];
}

function handleType(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  return schemaContext.types.map((type: Type) => ({
    filename: prefixAndPath + sanitizeFilename(type.name, 'type') + '.' + (fileExtension || ''),
    content: compiledTemplate(type),
  }));
}

function handleInputType(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  return schemaContext.inputTypes.map((type: Type) => ({
    filename: prefixAndPath + sanitizeFilename(type.name, 'input-type') + '.' + (fileExtension || ''),
    content: compiledTemplate(type),
  }));
}

function handleUnion(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  return schemaContext.unions.map((union: Union) => ({
    filename: prefixAndPath + sanitizeFilename(union.name, 'union') + '.' + (fileExtension || ''),
    content: compiledTemplate(union),
  }));
}

function handleEnum(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  return schemaContext.enums.map((en: Enum) => ({
    filename: prefixAndPath + sanitizeFilename(en.name, 'enum') + '.' + (fileExtension || ''),
    content: compiledTemplate(en),
  }));
}

function handleScalar(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  return schemaContext.scalars.map((scalar: Scalar) => ({
    filename: prefixAndPath + sanitizeFilename(scalar.name, 'scalar') + '.' + (fileExtension || ''),
    content: compiledTemplate(scalar),
  }));
}

function handleInterface(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  return schemaContext.interfaces.map((inf: Interface) => ({
    filename: prefixAndPath + sanitizeFilename(inf.name, 'interface') + '.' + (fileExtension || ''),
    content: compiledTemplate(inf),
  }));
}

function handleOperation(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  return documents.operations.map((operation: Operation) => ({
    filename: prefixAndPath + sanitizeFilename(operation.name, operation.operationType) + '.' + (fileExtension || ''),
    content: compiledTemplate(operation),
  }));
}

function handleFragment(compiledTemplate: Function, schemaContext: SchemaTemplateContext, documents: Document, fileExtension: string, prefixAndPath: string = ''): FileOutput[] {
  return documents.fragments.map((fragment: Fragment) => ({
    filename: prefixAndPath + sanitizeFilename(fragment.name, 'fragment') + '.' + (fileExtension || ''),
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
  const result: FileOutput[] = [];
  const schemaContext = (!executionSettings.generateSchema) ? prepareSchemaForDocumentsOnly(templateContext) : templateContext;

  Object.keys(templates).forEach(templateName => {
    const templateFn = templates[templateName];

    if (handlersMap[templateName]) {
      const handler = handlersMap[templateName];

      result.push(...handler(templateFn, schemaContext, documents, config.filesExtension))
    } else {
      const parsedTemplateName = parseTemplateName(templateName);

      if (parsedTemplateName !== null) {
        result.push(...parsedTemplateName.handler(templateFn, schemaContext, documents, parsedTemplateName.fileExtension, parsedTemplateName.prefix + '.'))
      }
    }
  });

  return result;
}
