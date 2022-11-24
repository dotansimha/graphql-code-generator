import { lifecycleHooks } from './hooks.js';
import { Types } from '@graphql-codegen/plugin-helpers';
import { executeCodegen } from './codegen.js';
import { createWatcher } from './utils/watcher.js';
import { readFile, writeFile, unlinkFile, mkdirp } from './utils/file-system.js';
import { dirname, join, isAbsolute } from 'path';
import { debugLog } from './utils/debugging.js';
import { CodegenContext, ensureContext } from './config.js';
import { createHash } from 'crypto';

const hash = (content: string): string => createHash('sha1').update(content).digest('base64');

export async function generate(
  input: CodegenContext | (Types.Config & { cwd?: string }),
  saveToFile = true
): Promise<Types.FileOutput[] | any> {
  const context = ensureContext(input);
  const config = context.getConfig();
  await context.profiler.run(() => lifecycleHooks(config.hooks).afterStart(), 'Lifecycle: afterStart');

  let previouslyGeneratedFilenames: string[] = [];
  function removeStaleFiles(config: Types.Config, generationResult: Types.FileOutput[]) {
    const filenames = generationResult.map(o => o.filename);
    // find stale files from previous build which are not present in current build
    const staleFilenames = previouslyGeneratedFilenames.filter(f => !filenames.includes(f));
    staleFilenames.forEach(filename => {
      if (shouldOverwrite(config, filename)) {
        return unlinkFile(filename, err => {
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

            const content = result.content || '';
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

            await lifecycleHooks(result.hooks).beforeOneFileWrite(result.filename);
            await lifecycleHooks(config.hooks).beforeOneFileWrite(result.filename);

            const basedir = dirname(result.filename);
            await mkdirp(basedir);
            const absolutePath = isAbsolute(result.filename)
              ? result.filename
              : join(input.cwd || process.cwd(), result.filename);

            await writeFile(absolutePath, content);
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
    return createWatcher(context, writeOutput);
  }

  const outputFiles = await context.profiler.run(() => executeCodegen(context), 'executeCodegen');

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
