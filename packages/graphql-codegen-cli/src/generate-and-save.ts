import { createHash } from 'crypto';
import { dirname, isAbsolute, join } from 'path';
import logSymbols from 'log-symbols';
import { Types } from '@graphql-codegen/plugin-helpers';
import { executeCodegen } from './codegen.js';
import { CodegenContext, ensureContext } from './config.js';
import { lifecycleHooks } from './hooks.js';
import { debugLog } from './utils/debugging.js';
import { mkdirp, readFile, unlinkFile, writeFile } from './utils/file-system.js';
import { createWatcher } from './utils/watcher.js';
import { getLogger } from './utils/logger.js';

const hash = (content: string): string => createHash('sha1').update(content).digest('base64');

export async function generate(
  input: CodegenContext | (Types.Config & { cwd?: string }),
  saveToFile = true
): Promise<
  | Types.FileOutput[]
  /**
   * When this function runs in watch mode, it'd return an empty promise that doesn't resolve until the watcher exits
   * FIXME: this effectively makes the result `any`, which loses type-hints
   */
  | any
> {
  const context = ensureContext(input);
  const config = context.getConfig();
  await context.profiler.run(() => lifecycleHooks(config.hooks).afterStart(), 'Lifecycle: afterStart');

  let previouslyGeneratedFilenames: string[] = [];

  function removeStaleFiles(config: Types.Config, generationResult: Types.FileOutput[]) {
    const filenames = generationResult.map(o => o.filename);
    // find stale files from previous build which are not present in current build
    const staleFilenames = previouslyGeneratedFilenames.filter(f => !filenames.includes(f));
    for (const filename of staleFilenames) {
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
    }
    previouslyGeneratedFilenames = filenames;
  }

  const recentOutputHash = new Map<string, string>();

  async function writeOutput(generationResult: Types.FileOutput[]): Promise<Types.FileOutput[]> {
    if (!saveToFile) {
      return generationResult;
    }

    if (config.watch) {
      removeStaleFiles(config, generationResult);
    }

    await context.profiler.run(async () => {
      await lifecycleHooks(config.hooks).beforeAllFileWrite(generationResult.map(r => r.filename));
    }, 'Lifecycle: beforeAllFileWrite');

    await context.profiler.run(
      () =>
        Promise.all(
          generationResult.map(async (result: Types.FileOutput) => {
            const previousHash = recentOutputHash.get(result.filename) || (await hashFile(result.filename));
            const exists = previousHash !== null;

            // Store previous hash to avoid reading from disk again
            if (previousHash) {
              recentOutputHash.set(result.filename, previousHash);
            }

            if (!shouldOverwrite(config, result.filename) && exists) {
              return;
            }

            let content = result.content || '';
            const currentHash = hash(content);

            if (previousHash && currentHash === previousHash) {
              debugLog(`Skipping file (${result.filename}) writing due to indentical hash...`);
              return;
            }

            // skip updating file in dry mode
            if (context.checkMode) {
              context.checkModeStaleFiles.push(result.filename);
              return;
            }

            if (content.length === 0) {
              return;
            }

            const absolutePath = isAbsolute(result.filename)
              ? result.filename
              : join(input.cwd || process.cwd(), result.filename);

            const basedir = dirname(absolutePath);
            await mkdirp(basedir);

            content = await lifecycleHooks(result.hooks).beforeOneFileWrite(absolutePath, content);
            content = await lifecycleHooks(config.hooks).beforeOneFileWrite(absolutePath, content);

            if (content !== result.content) {
              result.content = content;
              // compare the prettified content with the previous hash
              // to compare the content with an existing prettified file
              if (hash(content) === previousHash) {
                debugLog(`Skipping file (${result.filename}) writing due to indentical hash after prettier...`);
                // the modified content is NOT stored in recentOutputHash
                // so a diff can already be detected before executing the hook
                return;
              }
            }

            await writeFile(absolutePath, result.content);
            recentOutputHash.set(result.filename, currentHash);

            await lifecycleHooks(result.hooks).afterOneFileWrite(result.filename);
            await lifecycleHooks(config.hooks).afterOneFileWrite(result.filename);
          })
        ),
      'Write files'
    );

    await context.profiler.run(
      () => lifecycleHooks(config.hooks).afterAllFileWrite(generationResult.map(r => r.filename)),
      'Lifecycle: afterAllFileWrite'
    );

    return generationResult;
  }

  // watch mode
  if (config.watch) {
    return createWatcher(context, writeOutput).runningWatcher;
  }

  const { result: outputFiles, error } = await context.profiler.run(() => executeCodegen(context), 'executeCodegen');

  if (error) {
    // If all generation failed, just throw to return non-zero code.
    if (outputFiles.length === 0) {
      throw error;
    }

    // If partial success, but partial output is not allowed, throw to return non-zero code.
    if (!config.allowPartialOutputs) {
      getLogger().error(
        `  ${logSymbols.error} One or more errors occurred, no files were generated. To allow output on errors, set config.allowPartialOutputs=true`
      );
      throw error;
    }

    // If partial success, and partial output is allowed, warn and proceed to write to files.
    getLogger().warn(
      `  ${logSymbols.warning} One or more errors occurred, some files were generated. To prevent any output on errors, set config.allowPartialOutputs=false`
    );
  }

  await context.profiler.run(() => writeOutput(outputFiles), 'writeOutput');
  await context.profiler.run(() => lifecycleHooks(config.hooks).beforeDone(), 'Lifecycle: beforeDone');

  if (context.profilerOutput) {
    await writeFile(join(context.cwd, context.profilerOutput), JSON.stringify(context.profiler.collect()));
  }

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

async function hashFile(filePath: string): Promise<string | null> {
  try {
    return hash(await readFile(filePath));
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      // return null if file does not exist
      return null;
    }
    // rethrow unexpected errors
    throw err;
  }
}
