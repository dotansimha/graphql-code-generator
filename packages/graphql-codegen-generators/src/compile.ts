import { Config, FileOutput } from './types';
import { SchemaTemplateContext } from 'graphql-codegen-core';
import { compile } from 'handlebars';
import { typesToLanguagePrimitives } from './types-to-language-primitives';

export function compileTemplate(template: string, config: Config, templateContext: SchemaTemplateContext): FileOutput[] {
  const compiledTemplate = compile(template);
  const transformed = typesToLanguagePrimitives(config, templateContext);

  return [
    {
      filename: 'types.d.ts',
      content: compiledTemplate(transformed),
    },
  ];
}
