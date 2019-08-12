import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { Types } from '@graphql-codegen/plugin-helpers';
import { DetailedError } from '@graphql-codegen/core';
import { parseConfigFile } from './yml';
import { Command } from 'commander';

export type YamlCliFlags = {
  config: string;
  watch: boolean;
  require: string[];
  overwrite: boolean;
};

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

function loadAndParseConfig(filepath: string): Types.Config | never {
  const ext = filepath.substr(filepath.lastIndexOf('.') + 1);
  switch (ext) {
    case 'yml':
      return parseConfigFile(readFileSync(filepath, 'utf-8'));
    case 'json':
      return JSON.parse(readFileSync(filepath, 'utf-8'));
    case 'js':
      return require(resolve(process.cwd(), filepath));
    default:
      throw new DetailedError(
        `Extension '${ext}' is not supported`,
        `
        Config ${filepath} couldn't be parsed. Extension '${ext}' is not supported.
      `
      );
  }
}

function collect<T = string>(val: T, memo: T[]): T[] {
  memo.push(val);

  return memo;
}

export async function createConfig(argv = process.argv): Promise<Types.Config | never> {
  const cliFlags = (new Command()
    .usage('graphql-codegen [options]')
    .allowUnknownOption(true)
    .option('-c, --config <path>', 'Path to GraphQL codegen YAML config file, defaults to "codegen.yml" on the current directory')
    .option('-w, --watch', 'Watch for changes and execute generation automatically')
    .option('-s, --silent', 'A flag to not print errors in case they occur')
    .option('-r, --require [value]', 'Loads specific require.extensions before running the codegen and reading the configuration', collect, [])
    .option('-o, --overwrite', 'Overwrites existing files')
    .parse(argv) as any) as Command & YamlCliFlags;

  const customConfigPath = getCustomConfigPath(cliFlags);
  const locations: string[] = [join(process.cwd(), './codegen.yml'), join(process.cwd(), './codegen.json')];

  if (customConfigPath) {
    locations.unshift(customConfigPath);
  }

  const filepath = locations.find(existsSync);

  if (!filepath) {
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

  const parsedConfigFile = loadAndParseConfig(filepath);

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
