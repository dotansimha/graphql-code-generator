import { isAbsolute, relative } from 'path';
import { isValidPath } from '@graphql-tools/utils';
import { normalizeInstanceOrArray, Types } from '@graphql-codegen/plugin-helpers';
import isGlob from 'is-glob';
import mm from 'micromatch';
import { CodegenContext } from '../config.js';
import { isURL } from './helpers.js';

type NegatedPattern = `!${string}`;

/**
 * Flatten a list of pattern sets to be a list of only the affirmative patterns
 * are contained in all of them.
 *
 * This can be used, for example, to find the "longest common prefix directory"
 * by examining `mm.scan(pattern).base` for each `pattern`.
 */
export const allAffirmativePatternsFromPatternSets = (patternSets: PatternSet[]) => {
  return patternSets.flatMap(patternSet => [
    ...patternSet.watch.affirmative,
    ...patternSet.documents.affirmative,
    ...patternSet.schemas.affirmative,
  ]);
};

/**
 * Create a rebuild trigger that follows the algorithm described here:
 * https://github.com/dotansimha/graphql-code-generator/issues/9270#issuecomment-1496765045
 *
 * There is a flow chart diagram in that comment.
 *
 * Basically:
 *
 *  * "Global" patterns are defined at top level of config file, and "local"
 *    patterns are defined for each output target
 *  * Each pattern can have "watch", "documents", and "schemas"
 *  * Watch patterns (global and local) always take precedence over documents and
 *    schemas patterns, i.e. a watch negation always negates, and a watch match is
 *    a match even if it would be negated by some pattern in documents or schemas
 *  * The trigger returns true if any output target's local patterns result in
 *    a match, after considering the precedence of any global and local negations
 */
export const makeShouldRebuild = ({
  globalPatternSet,
  localPatternSets,
}: {
  globalPatternSet: PatternSet;
  localPatternSets: PatternSet[];
}) => {
  const localMatchers = localPatternSets.map(localPatternSet => {
    return (path: string) => {
      // Is path negated by any negating watch pattern?
      if (matchesAnyNegatedPattern(path, [...globalPatternSet.watch.negated, ...localPatternSet.watch.negated])) {
        // Short circut: negations in watch patterns take priority
        return false;
      }

      // Does path match any affirmative watch pattern?
      if (
        matchesAnyAffirmativePattern(path, [
          ...globalPatternSet.watch.affirmative,
          ...localPatternSet.watch.affirmative,
        ])
      ) {
        // Immediately return true: Watch pattern takes priority, even if documents or schema would negate it
        return true;
      }

      // Does path match documents patterns (without being negated)?
      if (
        matchesAnyAffirmativePattern(path, [
          ...globalPatternSet.documents.affirmative,
          ...localPatternSet.documents.affirmative,
        ]) &&
        !matchesAnyNegatedPattern(path, [...globalPatternSet.documents.negated, ...localPatternSet.documents.negated])
      ) {
        return true;
      }

      // Does path match schemas patterns (without being negated)?
      if (
        matchesAnyAffirmativePattern(path, [
          ...globalPatternSet.schemas.affirmative,
          ...localPatternSet.schemas.affirmative,
        ]) &&
        !matchesAnyNegatedPattern(path, [...globalPatternSet.schemas.negated, ...localPatternSet.schemas.negated])
      ) {
        return true;
      }

      // Otherwise, there is no match
      return false;
    };
  });

  /**
   * Return `true` if `path` should trigger a rebuild
   */
  return ({ path: absolutePath }: { path: string }) => {
    if (!isAbsolute(absolutePath)) {
      throw new Error('shouldRebuild trigger should be called with absolute path');
    }

    const path = relative(process.cwd(), absolutePath);
    const shouldRebuild = localMatchers.some(matcher => matcher(path));
    return shouldRebuild;
  };
};

/**
 * Create the pattern set for the "global" (top level) config.
 *
 * In the `shouldRebuild` algorithm, any of these watch patterns will take
 * precedence over local configs, and any schemas and documents patterns will be
 * mixed into the pattern set of each local config.
 */
export const makeGlobalPatternSet = (initialContext: CodegenContext) => {
  const config: Types.Config & { configFilePath?: string } = initialContext.getConfig();

  return {
    watch: sortPatterns([
      ...(typeof config.watch === 'boolean' ? [] : normalizeInstanceOrArray<string>(config.watch ?? [])),
      relative(process.cwd(), initialContext.filepath),
    ]),
    schemas: sortPatterns(makePatternsFromSchemas(normalizeInstanceOrArray<Types.Schema>(config.schema))),
    documents: sortPatterns(
      makePatternsFromDocuments(normalizeInstanceOrArray<Types.OperationDocument>(config.documents))
    ),
  };
};

/**
 * Create the pattern set for a "local" (output target) config
 *
 * In the `shouldRebuild` algorithm, any of these watch patterns will take
 * precedence over documents or schemas patterns, and the documents and schemas
 * patterns will be mixed into the pattern set of their respective gobal pattern
 * set equivalents.
 */
export const makeLocalPatternSet = (conf: Types.ConfiguredOutput) => {
  return {
    watch: sortPatterns(normalizeInstanceOrArray(conf.watchPattern)),
    documents: sortPatterns(
      makePatternsFromDocuments(normalizeInstanceOrArray<Types.OperationDocument>(conf.documents))
    ),
    schemas: sortPatterns(makePatternsFromSchemas(normalizeInstanceOrArray<Types.Schema>(conf.schema))),
  };
};

/**
 * Parse a list of micromatch patterns from a list of documents, which should
 * already have been normalized from their raw config values.
 */
const makePatternsFromDocuments = (documents: Types.OperationDocument[]): string[] => {
  const patterns: string[] = [];

  if (documents) {
    for (const doc of documents) {
      if (typeof doc === 'string') {
        patterns.push(doc);
      } else {
        patterns.push(...Object.keys(doc));
      }
    }
  }

  return patterns;
};

/**
 * Parse a list of micromatch patterns from a list of schemas, which should
 * already have been normalized from their raw config values.
 */
const makePatternsFromSchemas = (schemas: Types.Schema[]): string[] => {
  const patterns: string[] = [];

  for (const s of schemas) {
    const schema = s as string;
    if (!isURL(schema) && (isGlob(schema) || isValidPath(schema))) {
      patterns.push(schema);
    }
  }

  return patterns;
};

/**
 * Given a list of micromatch patterns, sort them into `patterns` (all of them),
 * `affirmative` (only the affirmative patterns), and `negated` (only the negated patterns)
 *
 * @param patterns List of micromatch patterns
 */
export const sortPatterns = <P extends string | NegatedPattern>(patterns: P[]): SortedPatterns<P> => ({
  patterns,
  affirmative: onlyAffirmativePatterns(patterns) as P[],
  negated: onlyNegatedPatterns(patterns) as Extract<P, NegatedPattern>[],
});

/**
 * A type that "sorts" (or "groups") patterns. For a given list of `patterns`,
 * this type will include the original list in `patterns`, all of its
 * "affirmative" (non-negated) patterns in `affirmative`, and all of its
 * "negated" patterns in `negated`
 */
type SortedPatterns<PP extends string | NegatedPattern = string | NegatedPattern> = {
  /** List of patterns, which could include both negated and affirmative patterns */
  patterns: PP[];
  /** List of only the affirmative (non-negated) patterns in `patterns` */
  affirmative: PP[];
  /** List of only the negated patterns in `patterns` */
  negated: Extract<PP, NegatedPattern>[];
};

/**
 * The global (top-level) config and each local (output target) config can have
 * patterns which are separable into "watch" (always takes precedence), "documents",
 * and "schemas". This type can hold sorted versions of these patterns.
 */
type PatternSet = {
  watch: SortedPatterns;
  documents: SortedPatterns;
  schemas: SortedPatterns;
};

/**
 * Filter the provided list of patterns to include only "affirmative" (non-negated) patterns.
 *
 * @param patterns List of micromatch patterns (or paths) to filter
 */
const onlyAffirmativePatterns = (patterns: string[]) => {
  return patterns.filter(pattern => !mm.scan(pattern).negated);
};

/**
 * Filter the provided list of patterns to include only negated patterns.
 *
 * @param patterns List of micromatch patterns (or paths) to filter
 */
const onlyNegatedPatterns = (patterns: string[]) => {
  return patterns.filter(pattern => mm.scan(pattern).negated);
};

/**
 * Given a list of negated patterns, invert them by removing their negation prefix
 *
 * If there is a non-negated pattern in the list, throw an error, because this
 * function should only be called after filtering the list to be only negated patterns
 *
 * @param patterns List of negated micromatch patterns
 */
const invertNegatedPatterns = (patterns: string[]) => {
  return patterns.map(pattern => {
    const scanned = mm.scan(pattern);
    if (!scanned.negated) {
      throw new Error(`onlyNegatedPatterns got a non-negated pattern: ${pattern}`);
    }

    // Remove the leading prefix (NOTE: this is not always "!")
    // e.g. mm.scan("!./foo/bar/never-watch.graphql").prefix === '!./'
    return pattern.slice(scanned.prefix.length);
  });
};

/**
 * Return true if relativeCandidatePath matches any of the affirmativePatterns
 *
 * @param relativeCandidatePath A relative path to evaluate against the supplied affirmativePatterns
 * @param affirmativePatterns A list of patterns, containing no negated patterns, to evaluate
 */
const matchesAnyAffirmativePattern = (relativeCandidatePath: string, affirmativePatterns: string[]) => {
  if (isAbsolute(relativeCandidatePath)) {
    throw new Error('matchesAny should only be called with relative candidate path');
  }

  // Developer error: This function is not intended to work with pattern sets including negations
  if (affirmativePatterns.some(pattern => mm.scan(pattern).negated)) {
    throw new Error('matchesAnyAffirmativePattern should only include affirmative patterns');
  }

  // micromatch.isMatch does not omit matches that are negated by negation patterns,
  // which is why we require this function only examine affirmative patterns
  return mm.isMatch(relativeCandidatePath, affirmativePatterns);
};

/**
 * Return true if relativeCandidatePath matches any of the negatedPatterns
 *
 * This function will invert the negated patterns and then call matchesAnyAffirmativePattern
 *
 * @param relativeCandidatePath A relative path to evaluate against the suppliednegatedPatterns
 * @param negatedPatterns A list of patterns, containing no negated patterns, to evaluate
 */
const matchesAnyNegatedPattern = (relativeCandidatePath: string, negatedPatterns: string[]) => {
  // NOTE: No safety check that negatedPatterns contains only negated, because that will happen in invertedNegatedPatterns
  return matchesAnyAffirmativePattern(relativeCandidatePath, invertNegatedPatterns(negatedPatterns));
};
