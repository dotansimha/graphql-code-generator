import { GeneratorConfig } from './types';
import TypescriptSingleFile from './typescript-single-file/config';
import TypescriptMultiFile from './typescript-multi-file/config';
import FlowSingleFile from './flow-single-file/config';

export const definitions = {
  // TypeScript single file
  ts: TypescriptSingleFile,
  typescript: TypescriptSingleFile,
  'ts-single': TypescriptSingleFile,
  'typescript-single': TypescriptSingleFile,
  // TypeScript multiple files
  'ts-multiple': TypescriptMultiFile,
  'typescript-multiple': TypescriptMultiFile,
  flow: FlowSingleFile,
  'flow-single': FlowSingleFile,
};

export function getGeneratorConfig(name: string): GeneratorConfig {
  return definitions[name];
}
