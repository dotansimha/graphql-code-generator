import * as cosmiconfig from 'cosmiconfig';
import { resolve } from 'path';
import { Types } from '@graphql-codegen/plugin-helpers';
import { DetailedError } from '@graphql-codegen/core';
import { Command } from 'commander';

export type YamlCliFlags = {
  config: string;
  watch: boolean;
  require: string[];
  overwrite: boolean;
};

function generateSearchPlaces(moduleName: string) {
  const extensions = ['json', 'yaml', 'yml', 'js', 'config.js'];
  // gives codegen.json...
  const regular = extensions.map(ext => `${moduleName}.${ext}`);
  // gives .codegenrc.json... but no .codegenrc.config.js
  const dot = extensions.filter(ext => ext !== 'config.js').map(ext => `.${moduleName}rc.${ext}`);

  return regular.concat(dot);
}

function customLoader(ext: 'json' | 'yaml' | 'js') {
  function loader(filepath: string, content: string) {
    if (typeof process !== 'undefined' && 'env' in process) {
      content = content.replace(/\$\{(.*)\}/g, (str, variable, index) => {
        let varName = variable;
        let defaultValue = '';

        if (variable.includes(':')) {
          const spl = variable.split(':');
          varName = spl.shift();
          defaultValue = spl.join(':');
        }

        return process.env[varName] || defaultValue;
      });
    }

    if (ext === 'json') {
      return (cosmiconfig as any).loadJson(filepath, content);
    }

    if (ext === 'yaml') {
      return (cosmiconfig as any).loadYaml(filepath, content);
    }

    if (ext === 'js') {
      return (cosmiconfig as any).loadJs(filepath, content);
    }
  }

  return {
    sync: loader,
    async: loader,
  };
}

export async function loadConfig(
  configFilePath?: string
):
  | Promise<{
      config: Types.Config;
      filepath: string;
    }>
  | never {
  const moduleName = 'codegen';
  const cosmi = cosmiconfig(moduleName, {
    searchPlaces: generateSearchPlaces(moduleName),
    loaders: {
      '.json': customLoader('json'),
      '.yaml': customLoader('yaml'),
      '.yml': customLoader('yaml'),
      '.js': customLoader('js'),
      noExt: customLoader('yaml'),
    },
  });
  const result = await (configFilePath ? cosmi.load(configFilePath) : cosmi.search(process.cwd()));

  if (!result) {
    if (configFilePath) {
      throw new DetailedError(
        `Config ${configFilePath} does not exist`,
        `
        Config ${configFilePath} does not exist.
  
          $ graphql-codegen --config ${configFilePath}
  
        Please make sure the --config points to a correct file.
      `
      );
    }

    throw new DetailedError(
      `Unable to find Codegen config file!`,
      `
        Please make sure that you have a configuration file under the current directory! 
      `
    );
  }

  if (result.isEmpty) {
    throw new DetailedError(
      `Found Codegen config file but it was empty!`,
      `
        Please make sure that you have a valid configuration file under the current directory!
      `
    );
  }

  return {
    filepath: result.filepath,
    config: result.config as Types.Config,
  };
}

function getCustomConfigPath(cliFlags: YamlCliFlags): string | null | never {
  const configFile = cliFlags.config;

  return configFile ? resolve(process.cwd(), configFile) : null;
}

function collect<T = string>(val: T, memo: T[]): T[] {
  memo.push(val);

  return memo;
}

export function parseArgv(argv = process.argv): Command & YamlCliFlags {
  return (new Command()
    .usage('graphql-codegen [options]')
    .allowUnknownOption(true)
    .option('-c, --config <path>', 'Path to GraphQL codegen YAML config file, defaults to "codegen.yml" on the current directory')
    .option('-w, --watch', 'Watch for changes and execute generation automatically')
    .option('-s, --silent', 'A flag to not print errors in case they occur')
    .option('-r, --require [value]', 'Loads specific require.extensions before running the codegen and reading the configuration', collect, [])
    .option('-o, --overwrite', 'Overwrites existing files')
    .parse(argv) as any) as Command & YamlCliFlags;
}

export async function createConfig(cliFlags: Command & YamlCliFlags = parseArgv(process.argv)): Promise<Types.Config | never> {
  if (cliFlags.require && cliFlags.require.length > 0) {
    for (const mod of cliFlags.require) {
      await import(mod);
    }
  }

  const customConfigPath = getCustomConfigPath(cliFlags);
  const configSearchResult = await loadConfig(customConfigPath);
  const parsedConfigFile = configSearchResult.config as Types.Config;

  parsedConfigFile.configFilePath = configSearchResult.filepath;

  if (cliFlags.watch === true) {
    parsedConfigFile.watch = cliFlags.watch;
  }

  if (cliFlags.overwrite === true) {
    parsedConfigFile.overwrite = cliFlags.overwrite;
  }

  if (cliFlags.silent === true) {
    parsedConfigFile.silent = cliFlags.silent;
  }

  return parsedConfigFile;
}
