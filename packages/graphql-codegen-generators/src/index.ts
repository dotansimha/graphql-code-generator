import TypescriptSingleFile from './typescript-single-file/config';
import TypescriptMultiFile from './typescript-multi-file/config';
import FlowSingleFile from './flow-single-file/config';

export {
  TypescriptSingleFile,
  TypescriptMultiFile,
  FlowSingleFile,
};

export { GeneratorConfig, EInputType } from './types';
export { getGeneratorConfig, definitions } from './get-generator';
