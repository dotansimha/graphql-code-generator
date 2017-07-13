export { compileTemplate } from './compile';
export { GeneratorConfig, FileOutput, EInputType } from './types';
export { ALLOWED_CUSTOM_TEMPLATE_EXT } from './generate-multiple-files';

import TypescriptSingleFile from './typescript-single-file/config';
import TypescriptMultiFile from './typescript-multi-file/config';

export { getGeneratorConfig } from './get-generator';

export {
  TypescriptSingleFile,
  TypescriptMultiFile,
};
