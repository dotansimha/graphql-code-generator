import { GeneratorConfig, FileOutput, Settings, EInputType, MultiFileTemplates } from './types';
import {
  Document, Enum, Fragment, Interface, Operation, Scalar, SchemaTemplateContext,
  Type, Union
} from 'graphql-codegen-core';
import { compile, registerPartial } from 'handlebars';
import { initHelpers } from './handlebars-extensions';
import { flattenTypes } from './flatten-types';
import { sanitizeFilename } from './sanitizie-filename';

export const DEFAULT_SETTINGS: Settings = {
  generateSchema: true,
  generateDocuments: true,
  verbose: !!process.env['VERBOSE'],
};

function prepareSchemaForDocumentsOnly(templateContext: SchemaTemplateContext): SchemaTemplateContext {
  let copy = Object.assign({}, templateContext);

  copy.interfaces = [];
  copy.unions = [];
  copy.types = [];
  copy.hasInterfaces = false;
  copy.hasUnions = false;
  copy.hasTypes = false;

  return copy;
}

function generateSingleFile(compiledIndexTemplate: HandlebarsTemplateDelegate, executionSettings: Settings, config: GeneratorConfig, templateContext: SchemaTemplateContext, documents: Document): FileOutput[] {
  return [
    {
      filename: config.outFile,
      content: compiledIndexTemplate({
        ...(!executionSettings.generateSchema) ? prepareSchemaForDocumentsOnly(templateContext) : templateContext,
        operations: documents.operations,
        fragments: documents.fragments,
        hasFragments: documents.hasFragments,
        hasOperations: documents.hasOperations,
      }),
    },
  ];
}

function generateMultipleFiles(templates: MultiFileTemplates, executionSettings: Settings, config: GeneratorConfig, templateContext: SchemaTemplateContext, documents: Document): FileOutput[] {
  const result: FileOutput[] = [];
  const schemaContext = (!executionSettings.generateSchema) ? prepareSchemaForDocumentsOnly(templateContext) : templateContext;

  templates.type.forEach((compiledTypeTemplate: HandlebarsTemplateDelegate) => {
    schemaContext.types.forEach((type: Type) => {
      result.push({
        filename: sanitizeFilename(type.name, 'type') + '.' + (config.filesExtension || ''),
        content: compiledTypeTemplate(type),
      });
    });
  });

  templates.inputType.forEach((compiledTypeTemplate: HandlebarsTemplateDelegate) => {
    schemaContext.inputTypes.forEach((type: Type) => {
      result.push({
        filename: sanitizeFilename(type.name, 'input-type') + '.' + (config.filesExtension || ''),
        content: compiledTypeTemplate(type),
      });
    });
  });

  templates.union.forEach((compiledTypeTemplate: HandlebarsTemplateDelegate) => {
    schemaContext.unions.forEach((union: Union) => {
      result.push({
        filename: sanitizeFilename(union.name, 'union') + '.' + (config.filesExtension || ''),
        content: compiledTypeTemplate(union),
      });
    });
  });

  templates.enum.forEach((compiledTypeTemplate: HandlebarsTemplateDelegate) => {
    schemaContext.enums.forEach((en: Enum) => {
      result.push({
        filename: sanitizeFilename(en.name, 'enum') + '.' + (config.filesExtension || ''),
        content: compiledTypeTemplate(en),
      });
    });
  });

  templates.scalar.forEach((compiledTypeTemplate: HandlebarsTemplateDelegate) => {
    schemaContext.scalars.forEach((scalar: Scalar) => {
      result.push({
        filename: sanitizeFilename(scalar.name, 'scalar') + '.' + (config.filesExtension || ''),
        content: compiledTypeTemplate(scalar),
      });
    });
  });

  templates.interface.forEach((compiledTypeTemplate: HandlebarsTemplateDelegate) => {
    schemaContext.interfaces.forEach((inf: Interface) => {
      result.push({
        filename: sanitizeFilename(inf.name, 'interface') + '.' + (config.filesExtension || ''),
        content: compiledTypeTemplate(inf),
      });
    });
  });

  return result;
}

function toArrayAndCompileTemplates(templateDef): HandlebarsTemplateDelegate[] {
  templateDef = templateDef || [];

  return (Array.isArray(templateDef) ? templateDef : [ templateDef ]).map(template => compile(template));
}

export function compileTemplate(config: GeneratorConfig, templateContext: SchemaTemplateContext, documents: Document[] = [], settings: Settings = DEFAULT_SETTINGS): FileOutput[] {
  initHelpers(config);
  const executionSettings = Object.assign(DEFAULT_SETTINGS, settings);
  const templates = config.templates;

  Object.keys(templates).forEach((templateName: string) => {
    registerPartial(templateName, templates[templateName]);
  });

  let mergedDocuments: Document;

  if (!executionSettings.generateDocuments) {
    mergedDocuments = {
      fragments: [],
      operations: [],
      hasFragments: false,
      hasOperations: false,
    };
  } else {
    mergedDocuments = documents.reduce((previousValue: Document, item: Document): Document => {
      const opArr = [...previousValue.operations, ...item.operations] as Operation[];
      const frArr = [...previousValue.fragments, ...item.fragments] as Fragment[];

      return {
        operations: opArr,
        fragments: frArr,
        hasFragments: frArr.length > 0,
        hasOperations: opArr.length > 0,
      }
    }, { hasFragments: false, hasOperations: false, operations: [], fragments: [] } as Document);

    if (config.flattenTypes) {
      mergedDocuments = flattenTypes(mergedDocuments);
    }
  }

  if (config.inputType === EInputType.SINGLE_FILE) {
    if (!templates['index']) {
      throw new Error(`Template 'index' is required when using inputType = SINGLE_FILE!`);
    }

    if (!config.outFile) {
      throw new Error('Config outFile is required when using inputType = SINGLE_FILE!')
    }

    return generateSingleFile(
      compile(templates['index']),
      executionSettings,
      config,
      templateContext,
      mergedDocuments,
    );
  } else if (config.inputType === EInputType.MULTIPLE_FILES) {
    if (!config.filesExtension) {
      throw new Error('Config filesExtension is required when using inputType = MULTIPLE_FILES!')
    }

    return generateMultipleFiles(
      {
        type: toArrayAndCompileTemplates(templates['type']),
        inputType: toArrayAndCompileTemplates(templates['inputType']),
        'interface': toArrayAndCompileTemplates(templates['interface']),
        union: toArrayAndCompileTemplates(templates['union']),
        scalar: toArrayAndCompileTemplates(templates['scalar']),
        'enum': toArrayAndCompileTemplates(templates['enum']),
      },
      executionSettings,
      config,
      templateContext,
      mergedDocuments,
    );
  } else if (config.inputType === EInputType.PROJECT) {
    if (!templates || typeof templates !== 'string') {
      throw new Error(`Templates 'type' is required when using inputType = PROJECT!`);
    }

  } else {
    throw new Error(`Invalid inputType specified: ${config.inputType}!`);
  }
}
