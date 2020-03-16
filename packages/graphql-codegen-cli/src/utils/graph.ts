import { Types, normalizeInstanceOrArray } from '@graphql-codegen/plugin-helpers';
import { DepGraph } from 'dependency-graph';
import { resolve } from 'path';
import minimatch from 'minimatch';
import { isString, isUrl, isGlob } from './helpers';

// 1. Generate DepGraph
// 2. Sort `generates` so they won't stuck waiting for each other (on max concurrency limit hit)
// 3. Shared Promise per each output (so we know when output is generated)

type Graph = {
  config: Types.ConfiguredOutput;
  success: () => void;
  fail: (error: any) => void;
  running: Promise<void>;
};

/**
 * This way we wont't get unhandled rejection issues.
 * Jest is super sensible, it fails the test when unhandled promise is detected.
 */
function createLazyPromise() {
  let error: any;
  let resolved = false;
  let promise: Promise<void>;

  let resolve: () => void;
  let reject: (error: any) => void;

  return {
    resolve() {
      if (!resolved) {
        // postpone resolve()
        resolved = true;
      }

      if (resolve) {
        // if promise was created, call resolve()
        resolve();
      }
    },
    reject(reason: any) {
      if (!error) {
        // postpone reject()
        error = reason;
      }

      if (reject) {
        // if promise was created, call reject()
        reject(reason);
      }
    },
    get promise() {
      // we only create if there was an attempt to consume it

      // if promise was not created
      if (!promise) {
        if (error) {
          // and we already postponed reject()
          // reject() now
          promise = Promise.reject(error);
        } else if (resolved) {
          // and we already postponed resolve()
          // resolve() now
          promise = Promise.resolve();
        } else {
          // if there was no reject() or resolve() postponed
          // just create a new promise
          // eslint-disable-next-line promise/param-names
          promise = new Promise<void>((yes, not) => {
            resolve = yes;
            reject = not;
          });
        }
      }

      // return our promise
      return promise;
    },
  };
}

// Generate graph of dependencies
export function createGraph({
  generates,
  cwd,
}: {
  generates: { [filename: string]: Types.ConfiguredOutput };
  cwd: string;
}) {
  const graph = new DepGraph<Graph>({
    circular: false,
  });

  for (const output in generates) {
    if (generates.hasOwnProperty(output)) {
      const config = generates[output];
      const state = createLazyPromise();

      graph.addNode(output, {
        config,
        success: state.resolve,
        fail: state.reject,
        // we need it to avoid unhandled promise rejection (especially in jest)
        get running() {
          return state.promise;
        },
      });
    }
  }

  // pass only file paths and glob patterns
  const isStringOrGlob = (val: any): val is string => isString(val) && !isUrl(val);

  // check if source file matches the pointer (file path or glob)
  const matchFile = (src: string, pointer: string): boolean => {
    if (isGlob(pointer)) {
      return minimatch(src, pointer);
    }

    return resolve(cwd, pointer) === resolve(cwd, src);
  };

  // set dependencies
  function findDependencies(src: string) {
    Object.keys(generates)
      // skip our output
      .filter(key => key !== src)
      // iterate over the rest
      .forEach(output => {
        const { config } = graph.getNodeData(output);
        // normalize so we get arrays (always)
        const outputSpecificSchemas: string[] = normalizeInstanceOrArray<Types.Schema>(config.schema).filter(
          isStringOrGlob
        );
        const outputSpecificDocuments = normalizeInstanceOrArray<Types.OperationDocument>(config.documents).filter(
          isStringOrGlob
        );

        outputSpecificSchemas.forEach(pointer => {
          if (matchFile(src, pointer)) {
            // our source depends on this output
            graph.addDependency(output, src);
          }
        });

        outputSpecificDocuments.forEach(pointer => {
          if (matchFile(src, pointer)) {
            // our source depends on this output
            graph.addDependency(output, src);
          }
        });
      });
  }

  // Look for dependencies in each output
  for (const output in generates) {
    if (generates.hasOwnProperty(output)) {
      findDependencies(output);
    }
  }

  return graph;
}

export async function waitForDependencies({
  graph,
  output,
}: {
  graph: DepGraph<Graph>;
  output: string;
}): Promise<void> {
  // wait for other outputs to resolve, the one that we depend on
  await Promise.all(
    graph
      .dependenciesOf(output)
      .filter(Boolean)
      .map(dep => graph.getNodeData(dep).running)
  );
}
