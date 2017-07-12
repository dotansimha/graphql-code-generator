export { compileTemplate } from './compile';
export { GeneratorConfig, FileOutput } from './types';

import TypescriptSingleFile from './typescript-single-file/config';
import TypescriptMultiFile from './typescript-multi-file/config';

export { getGeneratorConfig } from './get-generator';

export {
  TypescriptSingleFile,
  TypescriptMultiFile,
};
