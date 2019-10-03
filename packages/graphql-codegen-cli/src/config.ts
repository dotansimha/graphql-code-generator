import * as cosmiconfig from 'cosmiconfig';
import { existsSync } from 'fs';
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

export async function loadConfig(
  configFilePath?: string
): Promise<{
  isEmpty?: boolean;
  config: Types.Config;
  filepath: string;
}> {
  const cosmi = cosmiconfig('codegen');
  const result = await (configFilePath ? cosmi.load(configFilePath) : cosmi.search(process.cwd()));

  return {
    isEmpty: result.isEmpty,
    filepath: result.filepath,
    config: result.config as Types.Config,
  };
}

function getCustomConfigPath(cliFlags: YamlCliFlags): string | null | never {
  const configFile = cliFlags.config;

  if (configFile) {
    const configPath = resolve(process.cwd(), configFile);

    if (!existsSync(configPath)) {
      throw new DetailedError(
        `Config ${configPath} does not exist`,
        `
        Config ${configPath} does not exist.

          $ graphql-codegen --config ${configPath}

        Please make sure the --config points to a correct file.
      `
      );
    }

    return configPath;
  }

  return null;
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
  const customConfigPath = getCustomConfigPath(cliFlags);
  const configSearchResult = await loadConfig(customConfigPath);

  if (!configSearchResult || configSearchResult.isEmpty) {
    throw new DetailedError(
      `Unable to find Codegen config file!`,
      `
        Please make sure that you have a configuration file under the current directory! 
      `
    );
  }

  if (cliFlags.require && cliFlags.require.length > 0) {
    for (const mod of cliFlags.require) {
      await import(mod);
    }
  }

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
