import { CLIOptions, executeWithOptions } from './codegen';
import { prettify } from './utils/prettier';
import { fileExists } from './utils/file-exists';
import { FileOutput, debugLog, logger } from 'graphql-codegen-core';
import * as fs from 'fs';

export function generate(options: CLIOptions, saveToFile = true) {
  return executeWithOptions(options).then((generationResult: FileOutput[]) => {
    if (!saveToFile) {
      return generationResult;
    }

    debugLog(`Generation result contains total of ${generationResult.length} files...`);

    if (process.env.VERBOSE !== undefined) {
      logger.info(`Generation result is: `, generationResult);
    }

    generationResult.forEach(async (result: FileOutput) => {
      if (!options.overwrite && fileExists(result.filename)) {
        logger.info(`Generated file skipped (already exists, and no-overwrite flag is ON): ${result.filename}`);

        return;
      }

      const content = result.content.trim();

      if (content.length === 0) {
        logger.info(`Generated file skipped (empty): ${result.filename}`);

        return;
      }

      fs.writeFileSync(result.filename, await prettify(result.filename, result.content));
      logger.info(`Generated file written to ${result.filename}`);
    });

    return generationResult;
  });
}
