import { lifecycleHooks } from './hooks';
import { Types } from '@graphql-codegen/plugin-helpers';
import { executeCodegen } from './codegen';
import { createWatcher } from './utils/watcher';
import { fileExists, readSync, writeSync, unlinkFile } from './utils/file-system';
import mkdirp from 'mkdirp';
import { dirname, join, isAbsolute } from 'path';
import { debugLog } from './utils/debugging';
import { CodegenContext, ensureContext } from './config';
import { createHash } from 'crypto';

const hash = (content: string): string => createHash('sha1').update(content).digest('base64');

export async function generate(
  input: CodegenContext | (Types.Config & { cwd?: string }),
  saveToFile = true
): Promise<Types.FileOutput[] | any> {
  const context = ensureContext(input);
  const config = context.getConfig();
  await lifecycleHooks(config.hooks).afterStart();

  let previouslyGeneratedFilenames: string[] = [];
  function removeStaleFiles(config: Types.Config, generationResult: Types.FileOutput[]) {
    const filenames = generationResult.map(o => o.filename);
    // find stale files from previous build which are not present in current build
    const staleFilenames = previouslyGeneratedFilenames.filter(f => !filenames.includes(f));
    staleFilenames.forEach(filename => {
      if (shouldOverwrite(config, filename)) {
        unlinkFile(filename, err => {
          const prettyFilename = filename.replace(`${input.cwd || process.cwd()}/`, '');
          if (err) {
            debugLog(`Cannot remove stale file: ${prettyFilename}\n${err}`);
          } else {
            debugLog(`Removed stale file: ${prettyFilename}`);
          }
        });
      }
    });
    previouslyGeneratedFilenames = filenames;
  }

  const recentOutputHash = new Map<string, string>();
  async function writeOutput(generationResult: Types.FileOutput[]) {
    if (!saveToFile) {
      return generationResult;
    }

    if (config.watch) {
      removeStaleFiles(config, generationResult);
    }

    await lifecycleHooks(config.hooks).beforeAllFileWrite(generationResult.map(r => r.filename));

    await Promise.all(
      generationResult.map(async (result: Types.FileOutput) => {
        const exists = fileExists(result.filename);

        if (!shouldOverwrite(config, result.filename) && exists) {
          return;
        }

        const content = result.content || '';
        const currentHash = hash(content);
        let previousHash = recentOutputHash.get(result.filename);

        if (!previousHash && exists) {
          previousHash = hash(readSync(result.filename));
        }

        if (previousHash && currentHash === previousHash) {
          debugLog(`Skipping file (${result.filename}) writing due to indentical hash...`);

          return;
        }

        if (content.length === 0) {
          return;
        }

        recentOutputHash.set(result.filename, currentHash);
        const basedir = dirname(result.filename);
        await lifecycleHooks(result.hooks).beforeOneFileWrite(result.filename);
        await lifecycleHooks(config.hooks).beforeOneFileWrite(result.filename);
        mkdirp.sync(basedir);
        const absolutePath = isAbsolute(result.filename)
          ? result.filename
          : join(input.cwd || process.cwd(), result.filename);
        writeSync(absolutePath, result.content);
        await lifecycleHooks(result.hooks).afterOneFileWrite(result.filename);
        await lifecycleHooks(config.hooks).afterOneFileWrite(result.filename);
      })
    );

    await lifecycleHooks(config.hooks).afterAllFileWrite(generationResult.map(r => r.filename));

    return generationResult;
  }

  // watch mode
  if (config.watch) {
    return createWatcher(context, writeOutput);
  }

  const outputFiles = await executeCodegen(context);

  await writeOutput(outputFiles);

  lifecycleHooks(config.hooks).beforeDone();

  return outputFiles;
}

function shouldOverwrite(config: Types.Config, outputPath: string): boolean {
  const globalValue = config.overwrite === undefined ? true : !!config.overwrite;
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
