import { FileOutput, Types } from 'graphql-codegen-core';
import { executeCodegen } from './codegen';
import { fileExists } from './utils/file-exists';
import { writeFileSync } from 'fs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function generate(config: Types.Config, saveToFile = true): Promise<FileOutput[] | any> {
  const outputFiles = await executeCodegen(config);

  if (saveToFile) {
    await Promise.all(
      outputFiles.map(async (result: FileOutput) => {
        if (!config.overwrite && fileExists(result.filename)) {
          // spinner.succeed(`Generated file skipped (already exists, and no-overwrite flag is ON): ${result.filename}`);
          return;
        }

        const content = result.content || '';

        if (content.length === 0) {
          // spinner.succeed(`Generated file skipped (empty): ${result.filename}`);
          return;
        }

        writeFileSync(result.filename, result.content);
        // spinner.succeed(`Generated file written to ${result.filename}`);
      })
    );
  }

  return outputFiles;
}
