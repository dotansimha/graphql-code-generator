import { extname } from 'path';

export type Config = {
  generates: Record<
    string,
    {
      plugins: (string | unknown)[];
      preset?: string;
      presetConfig?: {
        baseTypesPath: string;
        extension: string;
        typesPath: string;
      };
    }
  >;
};

export function getMode(config: Config) {
  const ext = extname(Object.keys(config.generates)[0]);
  switch (ext.slice(1)) {
    case 'graphql':
      return 'graphql';
    case 'json':
      return 'json';
    case 'java':
      return 'java';
    case 'js':
    case 'jsx':
      return 'javascript';
    default:
      return 'text/typescript';
  }
}
