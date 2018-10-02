import * as prettier from 'prettier';
import * as path from 'path';

const EXTENSION_TO_PARSER = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'babylon',
  jsx: 'babylon',
  'js.flow': 'flow',
  flow: 'flow',
  gql: 'graphql',
  graphql: 'graphql',
  css: 'postcss',
  scss: 'postcss',
  less: 'postcss',
  stylus: 'postcss',
  markdown: 'markdown',
  md: 'markdown',
  json: 'json'
};

export async function prettify(filePath: string, content: string): Promise<string> {
  try {
    const fileExtension = path.extname(filePath).slice(1) as keyof typeof EXTENSION_TO_PARSER;
    const parser = EXTENSION_TO_PARSER[fileExtension];
    const config = await prettier.resolveConfig(process.cwd(), { useCache: true, editorconfig: true });

    return prettier.format(content, {
      parser,
      ...(config || {})
    } as any);
  } catch (e) {
    return content;
  }
}
