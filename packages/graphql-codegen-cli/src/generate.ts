import { executeWithOptions } from './codegen';
import { prettify } from './utils/prettier';
import { fileExists } from './utils/file-exists';
import { debugLog, FileOutput, getLogger } from 'graphql-codegen-core';
import * as fs from 'fs';
import { CLIOptions } from './cli-options';
import { createWatcher } from './utils/watcher';
import { setLogger, setSilentLogger, useWinstonLogger } from 'graphql-codegen-core';
import { Logger } from 'ts-log';
import { logWithSpinner, succeedSpinner, failSpinner } from './spinner';

interface GenerateOptions extends CLIOptions {
  logger?: Logger;
  templateConfig?: { [key: string]: any };
}

export async function generate(options: GenerateOptions, saveToFile = true): Promise<FileOutput[] | any> {
  if (options.silent) {
    setSilentLogger();
  } else if (options.logger) {
    setLogger(options.logger);
  } else {
    useWinstonLogger();
  }

  const writeOutput = async (generationResult: FileOutput[]): Promise<FileOutput[]> => {
    if (!saveToFile) {
      return generationResult;
    }

    logWithSpinner('Generating output');

    debugLog(`Generation result contains total of ${generationResult.length} files...`);

    if (process.env.VERBOSE !== undefined) {
      getLogger().info(`Generation result is: `, generationResult);
    }

    try {
      await Promise.all(
        generationResult.map(async (result: FileOutput) => {
          if (!options.overwrite && fileExists(result.filename)) {
            succeedSpinner(`Generated file skipped (already exists, and no-overwrite flag is ON): ${result.filename}`);
            return;
          }

          const content = result.content.trim();

          if (content.length === 0) {
            succeedSpinner(`Generated file skipped (empty): ${result.filename}`);
            return;
          }

          fs.writeFileSync(result.filename, await prettify(result.filename, result.content));
          succeedSpinner(`Generated file written to ${result.filename}`);
        })
      );
    } catch (error) {
      failSpinner();
      throw error;
    }

    return generationResult;
  };

  if (options.watch === true) {
    return createWatcher(options, writeOutput);
  }

  try {
    const output = await executeWithOptions(options);
    return writeOutput(output);
  } catch (error) {
    failSpinner();
    throw error;
  }
}
