import { FileOutput, Types } from 'graphql-codegen-core';
import { executeCodegen } from './codegen';
import { createWatcher } from './utils/watcher';
import { fileExists } from './utils/file-exists';
import { writeFileSync } from 'fs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function generate(config: Types.Config, saveToFile = true): Promise<FileOutput[] | any> {
  async function writeOutput(generationResult: FileOutput[]) {
    if (!saveToFile) {
      return generationResult;
    }

    await Promise.all(
      generationResult.map(async (result: FileOutput) => {
        if (!config.overwrite && fileExists(result.filename)) {
          return;
        }

        const content = result.content || '';

        if (content.length === 0) {
          return;
        }

        writeFileSync(result.filename, result.content);
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
