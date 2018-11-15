import { initCLI, createConfigFromOldCli } from './old-cli-config';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { Types } from 'graphql-codegen-core';
import { DetailedError } from './errors';
import { parseConfigFile } from './yml';

function getCustomConfig(): string | null | never {
  const [, , flag, filepath] = process.argv;

  if (!flag) {
    return null;
  }

  const flagIsConfig = ['--config', '-c'].includes(flag.toLocaleLowerCase());
  const hasFilepath = typeof filepath === 'string' && filepath.length > 0;
  const noOtherFlags = process.argv.length === 4;

  if (flagIsConfig && hasFilepath && noOtherFlags) {
    const configPath = resolve(process.cwd(), filepath);

    if (!existsSync(configPath)) {
      throw new DetailedError(
        `Config ${configPath} does not exist`,
        `
        Config ${configPath} does not exist.

          $ gql-gen --config ${configPath}

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
    default:
      throw new DetailedError(
        `Extension '${ext}' is not supported`,
        `
        Config ${filepath} couldn't be parsed. Extension '${ext}' is not supported.
      `
      );
  }
}

export function createConfig(): Types.Config | never {
  const customConfigPath = getCustomConfig();
  const locations: string[] = [join(process.cwd(), './codegen.yml'), join(process.cwd(), './codegen.json')];

  if (customConfigPath) {
    locations.unshift(customConfigPath);
  }

  const filepath = locations.find(existsSync);

  if (!filepath) {
    return createConfigFromOldCli(initCLI(process.argv));
  }

  return loadAndParseConfig(filepath);
}
