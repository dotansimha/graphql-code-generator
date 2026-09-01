import { createHash } from 'crypto';
import { dirname, isAbsolute, join } from 'path';
import logSymbols from 'log-symbols';
import { Types } from '@graphql-codegen/plugin-helpers';
import { executeCodegen } from './codegen.js';
import { CodegenContext, ensureContext } from './config.js';
import { lifecycleHooks } from './hooks.js';
import { debugLog } from './utils/debugging.js';
import { mkdirp, readFile, unlinkFile, writeFile } from './utils/file-system.js';
import { getLogger } from './utils/logger.js';
import { createWatcher } from './utils/watcher.js';

const hash = (content: string): string => createHash('sha1').update(content).digest('base64');

export async function generate(
  input: CodegenContext | (Types.Config & { cwd?: string }),
  saveToFile = true,
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
  await context.profiler.run(
    () => lifecycleHooks(config.hooks).afterStart(),
    'Lifecycle: afterStart',
  );

  // Store only the projection (`filename` + `overwrite`) rather than full results, so a
  // file that disappears is still judged by the `overwrite` of the entry that produced it.
  let previouslyGeneratedFiles: Pick<Types.FileOutput, 'filename' | 'overwrite'>[] = [];

  function removeStaleFiles(config: Types.Config, generationResult: Types.FileOutput[]) {
    const filenames = generationResult.map(o => o.filename);
    // find stale files from previous build which are not present in current build
    const staleFiles = previouslyGeneratedFiles.filter(f => !filenames.includes(f.filename));
    for (const staleFile of staleFiles) {
      if (normalizeOverwriteConfig(config.overwrite, staleFile.overwrite).removeStaleFiles) {
        unlinkFile(staleFile.filename, err => {
          const prettyFilename = staleFile.filename.replace(`${input.cwd || process.cwd()}/`, '');
          if (err) {
            debugLog(`Cannot remove stale file: ${prettyFilename}\n${err}`);
          } else {
            debugLog(`Removed stale file: ${prettyFilename}`);
          }
        });
      }
    }
    previouslyGeneratedFiles = generationResult.map(res => ({
      filename: res.filename,
      overwrite: res.overwrite,
    }));
  }

  // Records the hash of the content codegen last wrote per file. This is always
  // kept up to date; `FileOutput.contentComparison` only decides whether the
  // skip-check trusts this record ('cache-first') or re-reads the file from disk
  // ('disk'), for outputs whose content depends on the file's existing content.
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
          generationResult.map(async result => {
            // The "previous" hash the skip-check compares against:
            // - 'cache-first' trusts the in-memory record of what codegen last wrote
            // (falling back to disk when there's no entry).
            // - 'disk' always re-reads the file, because the output's content
            // depends on the file's existing content
            // (e.g. a preset that reads the file and rewrites part of it), so the
            // in-memory record could wrongly skip a write when the file was changed
            // on disk but the regenerated content matches a previous run.
            const previousHash = await (async function getPreviousHash(): Promise<string | null> {
              const { contentComparison = 'cache-first' } = result;

              if (contentComparison === 'disk') {
                return await hashFile(result.filename);
              }

              return recentOutputHash.get(result.filename) || (await hashFile(result.filename));
            })();
            const exists = previousHash !== null;

            // Always update the cache, regardless of `cache-first` or `disk` option,
            // so subsequent runs have consistent entry to compare against
            if (previousHash) {
              recentOutputHash.set(result.filename, previousHash);
            }

            if (
              !normalizeOverwriteConfig(config.overwrite, result.overwrite).updateExistingFiles &&
              exists
            ) {
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
                debugLog(
                  `Skipping file (${result.filename}) writing due to indentical hash after prettier...`,
                );
                // the modified content is NOT stored in recentOutputHash
                // so a diff can already be detected before executing the hook
                return;
              }
            }

            await writeFile(absolutePath, result.content);
            recentOutputHash.set(result.filename, currentHash);

            await lifecycleHooks(result.hooks).afterOneFileWrite(result.filename);
            await lifecycleHooks(config.hooks).afterOneFileWrite(result.filename);
          }),
        ),
      'Write files',
    );

    await context.profiler.run(
      () => lifecycleHooks(config.hooks).afterAllFileWrite(generationResult.map(r => r.filename)),
      'Lifecycle: afterAllFileWrite',
    );

    return generationResult;
  }

  // Flush the collected profiler events to disk, then reset the profiler so the
  // next run produces its own trace under a fresh filename. No-op when profiling
  // is disabled (the noop profiler has no `outputName`).
  async function writeProfilerOutput(): Promise<void> {
    const { profiler } = context;
    if (!profiler.outputName) {
      return;
    }

    await writeFile(join(context.cwd, profiler.outputName), JSON.stringify(profiler.collect()));
    profiler.clear();
  }

  // watch mode
  if (config.watch) {
    return createWatcher(context, writeOutput, writeProfilerOutput).runningWatcher;
  }

  const { result: outputFiles, error } = await context.profiler.run(
    () => executeCodegen(context),
    'executeCodegen',
  );

  if (error) {
    // If all generation failed, just throw to return non-zero code.
    if (outputFiles.length === 0) {
      throw error;
    }

    // If partial success, but partial output is not allowed, throw to return non-zero code.
    if (!config.allowPartialOutputs) {
      getLogger().error(
        `  ${logSymbols.error} One or more errors occurred, no files were generated. To allow output on errors, set config.allowPartialOutputs=true`,
      );
      throw error;
    }

    // If partial success, and partial output is allowed, warn and proceed to write to files.
    getLogger().warn(
      `  ${logSymbols.warning} One or more errors occurred, some files were generated. To prevent any output on errors, set config.allowPartialOutputs=false`,
    );
  }

  await context.profiler.run(() => writeOutput(outputFiles), 'writeOutput');
  await context.profiler.run(
    () => lifecycleHooks(config.hooks).beforeDone(),
    'Lifecycle: beforeDone',
  );

  await writeProfilerOutput();

  return outputFiles;
}

function normalizeOverwriteConfig(
  configOverwrite: Types.Config['overwrite'],
  fileOverwrite: Types.FileOutput['overwrite'],
): Types.NormalizedOverwriteOption {
  const overwrite = fileOverwrite ?? configOverwrite ?? true;

  if (overwrite === true) {
    return {
      removeStaleFiles: true,
      updateExistingFiles: true,
    };
  }

  if (overwrite === false) {
    return {
      removeStaleFiles: false,
      updateExistingFiles: false,
    };
  }

  const { removeStaleFiles = true, updateExistingFiles = true } = overwrite;

  return { removeStaleFiles, updateExistingFiles };
}

async function hashFile(filePath: string): Promise<string | null> {
  try {
    return hash(await readFile(filePath));
  } catch (err: any) {
    if (err && err.code === 'ENOENT') {
      // return null if file does not exist
      return null;
    }
    // rethrow unexpected errors
    throw err;
  }
}
