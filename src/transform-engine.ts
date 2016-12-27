import {IntrospectionQuery} from 'graphql/utilities/introspectionQuery';
import {loadSchema} from './scheme-loader';
import {prepareCodegen} from './codegen';
import {loadDocumentsSources} from './document-loader';
import {compileTemplate, loadFromPath} from './template-loader';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import {Model, CodegenDocument} from './interfaces';
import {GeneratorTemplate} from './templates';
import {
  initHelpers, initPartials, PartialDefinition, HelperDefinition,
  initTemplateHelpers
} from './handlebars-helpers';

export interface TransformedOptions {
  introspection?: IntrospectionQuery;
  documents?: string[];
  template?: GeneratorTemplate;
  outPath?: string;
  isDev?: boolean;
  noSchema?: boolean;
  noDocuments?: boolean;
}

export interface FileResult {
  path: string;
  content: string;
  isDev?: boolean;
}

export function Transform(transformedOptions: TransformedOptions): FileResult[] {
  const templateConfig = transformedOptions.template.config;
  initHelpers();
  initPartials((templateConfig.partials || []).map<PartialDefinition>((partialPath: string) => {
    return {
      content: loadFromPath(path.resolve(__dirname, transformedOptions.template.config.basePath, partialPath)),
      name: path.basename(partialPath, path.extname(partialPath))
    };
  }));
  initTemplateHelpers((templateConfig.helpers || []).map<HelperDefinition>((helperPath: string) => {
    return {
      func: require(path.resolve(__dirname, transformedOptions.template.config.basePath, helperPath)),
      name: path.basename(helperPath, path.extname(helperPath))
    };
  }));
  const schema = loadSchema(transformedOptions.introspection);
  const documents = transformedOptions.documents;
  const codegen = prepareCodegen(schema, loadDocumentsSources(documents), transformedOptions.template.config.primitives, {
    flattenInnerTypes: templateConfig.flattenInnerTypes,
    noSchema: transformedOptions.noSchema,
    noDocuments: transformedOptions.noDocuments
  });
  const strategy = templateConfig.strategy || 'SINGLE_FILE';
  const baseOutPath = path.basename(transformedOptions.outPath);

  if (strategy === 'SINGLE_FILE') {
    if (baseOutPath.indexOf('.') === -1) {
      throw `Generator '${transformedOptions.template.language}' uses single-file strategy! Please specify a filename using --out flag!`;
    }

    const templatePath = path.resolve(__dirname, transformedOptions.template.config.basePath, transformedOptions.template.config.template);
    const outPath = path.resolve(transformedOptions.outPath);
    const outDir = path.dirname(outPath);
    mkdirp.sync(outDir);

    return [{
      isDev: transformedOptions.isDev,
      content: compileTemplate(codegen, templatePath),
      path: outPath
    }];
  }
  else if (strategy === 'MULTIPLE_FILES') {
    if (baseOutPath.indexOf('.') > -1) {
      throw `Generator '${transformedOptions.template.language}' uses multiple-files strategy! Please specify a directory using --out flag!`;
    }

    let resultsArr: FileResult[] = [];
    const filesExtension = transformedOptions.template.config.filesExtension;
    const templates = transformedOptions.template.config.templates;
    const outPath = path.resolve(transformedOptions.outPath);
    mkdirp.sync(outPath);

    Object.keys(templates).forEach((templateName: string) => {
      const templatePath = path.resolve(__dirname, transformedOptions.template.config.basePath, templates[templateName]);

      if (templateName === 'model') {
        codegen.models.forEach((model: Model) => {
          resultsArr.push({
            isDev: transformedOptions.isDev,
            content: compileTemplate(model, templatePath),
            path: path.resolve(transformedOptions.outPath, model.name + '.model.' + filesExtension)
          });
        });
      }

      if (templateName === 'document') {
        codegen.documents.forEach((document: CodegenDocument) => {
          resultsArr.push({
            isDev: transformedOptions.isDev,
            content: compileTemplate(document, templatePath),
            path: path.resolve(transformedOptions.outPath, document.name + '.document.' + filesExtension)
          });
        });
      }
    });

    resultsArr = resultsArr.filter(item => item.content.length > 0);

    if (templates['index']) {
      const directoryPath = path.resolve(transformedOptions.outPath);
      const indexOutPath = path.resolve(directoryPath, 'index.' + filesExtension);
      const templatePath = path.resolve(transformedOptions.template.config.basePath, templates['index']);

      resultsArr.push({
        isDev: transformedOptions.isDev,
        content: compileTemplate({files: resultsArr.map(item => {
          return {
            fileName: path.basename(item.path, '.' + filesExtension),
            fullPath: item.path,
            extension: filesExtension,
            directory: directoryPath
          };
        })}, templatePath),
        path: indexOutPath
      });
    }

    return resultsArr;
  }
  else {
    throw `Unknown strategy (${strategy}) specified in language template ${transformedOptions.template.language}`;
  }
}

export default Transform;
