import { FileOutput, Types, debugLog } from 'graphql-codegen-plugin-helpers';
import { executeCodegen } from './codegen';
import { createWatcher } from './utils/watcher';
import { fileExists, writeSync } from './utils/file-system';
import { sync as mkdirpSync } from 'mkdirp';
import { dirname } from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function generate(config: Types.Config, saveToFile = true): Promise<FileOutput[] | any> {
  async function writeOutput(generationResult: FileOutput[]) {
    if (!saveToFile) {
      return generationResult;
    }

    await Promise.all(
      generationResult.map(async (result: FileOutput) => {
        if (!shouldOverwrite(config, result.filename) && fileExists(result.filename)) {
          return;
        }

        const content = result.content || '';

        if (content.length === 0) {
          return;
        }

        const basedir = dirname(result.filename);
        mkdirpSync(basedir);
        writeSync(result.filename, result.content);
      })
    );

    return generationResult;
  }

  // watch mode
  if (config.watch) {
    return createWatcher(config, writeOutput);
  }

  const outputFiles = await executeCodegen(config);

  await writeOutput(outputFiles);

  return outputFiles;
}

function shouldOverwrite(config: Types.Config, outputPath: string): boolean {
  const globalValue = !!config.overwrite;
  const outputConfig = config.generates[outputPath];

  if (!outputConfig) {
    debugLog(`Couldn't find a config of ${outputPath}`);
    return globalValue;
  }

  if (isConfiguredOutput(outputConfig) && typeof outputConfig.overwrite === 'boolean') {
    return outputConfig.overwrite;
  }

  return globalValue;
}

function isConfiguredOutput(output: any): output is Types.ConfiguredOutput {
  return typeof output.plugins !== 'undefined';
}
