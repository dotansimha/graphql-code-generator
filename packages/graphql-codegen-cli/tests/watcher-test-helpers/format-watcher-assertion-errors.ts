import { relative } from 'path';
import chalk from 'chalk';

/**
 * Format an error message when a glob is not ignored by Parcel Watcher
 */
export const formatErrorGlobNotIgnoredByParcelWatcher = ({
  expectedGlob,
  parcelIgnoredGlobs,
  jestErrorMessage,
  watchDirectory,
}: {
  expectedGlob: string;
  parcelIgnoredGlobs: string[];
  jestErrorMessage: string;
  watchDirectory: string;
}) => {
  const rawGlobTableLines = [
    'Expected glob not found:',
    expectedGlob,
    'globs received by ParcelWatcher.Options.ignore',
    '----------------------------------------------------',
    ...parcelIgnoredGlobs,
  ];

  const maxGlobLength = Math.max(...rawGlobTableLines.map(s => s.length));

  const globTableLineFormatters: ((s: string) => string)[] = [s => s, s => chalk.red(s), s => chalk.bold(s)];

  const tableLines = rawGlobTableLines.map((line, rowNum) => {
    const formatLine = globTableLineFormatters[rowNum] ?? (s => s);

    return `| ${chalk.reset(formatLine(line.padStart(maxGlobLength)))} |`;
  });

  return `${[
    chalk.gray(
      '-----------------------------------------',
      'Watch Mode Parcel Ignore Assertion Failure:',
      '-----------------------------------------'
    ),
    '',
    chalk.gray(chalk.bold('Note:'), 'Assertion should specify path relative to watch directory,'),
    chalk.gray(
      '      i.e. exactly as given to ParcelWatcher (unlike path assertions which should be relative to cwd),'
    ),
    chalk.gray('      because glob assertion looks for an exact match and does not convert paths.'),
    '',
    chalk.gray(chalk.bold('watchDirectory:'), watchDirectory),
    ' ',
    ' ',
    ...tableLines,
    ' ',
    chalk.gray(
      '----------------------------------------------------',
      'Raw Error (from Jest):',
      '---------------------------------------------------'
    ),
  ].join('\n')}\n${jestErrorMessage}`;
};

/**
 * Format an error message when a path is not ignored by Parcel Watcher
 */
export const formatErrorPathNotIgnoredByParcelWatcher = ({
  expectedPath,
  parcelIgnoredPaths,
  parcelIgnoredPathsRelativeFromCwd,
  jestErrorMessage,
  watchDirectory,
}: {
  expectedPath: string;
  watchDirectory: string;
  parcelIgnoredPaths: string[];
  parcelIgnoredPathsRelativeFromCwd: string[];
  jestErrorMessage: string;
}) => {
  const leftCol = [
    '',
    '',
    'ParcelWatcher.Options[ignore]',
    'Thee raw values were received in the options.ignore argument',
    'of ParcelWatcher.subscribe, which ParcelWatcher expects to be',
    'either an absolute path, or relative to watchDirectory',
    '--------------------------------------------------------------+',
    ...parcelIgnoredPaths,
  ];

  const rightCol = [
    'Match not found:',
    expectedPath,
    'Converted to be relative from CWD',
    'Each value was converted to be relative from CWD, (assuming',
    'that the inputs were correctly relative to watchDirectory),',
    'and then we scanned this column looking for a match.',
    '+--------------------------------------------------------------',
    ...parcelIgnoredPathsRelativeFromCwd,
  ];

  const headerFormatters: [(s: string) => string, (s: string) => string][] = [
    [s => chalk.gray(s), s => chalk.gray(s)],
    [s => s, s => chalk.red(s)],
    [s => chalk.bold(s), s => chalk.bold(s)],
    [s => chalk.gray(s), s => chalk.gray(s)],
    [s => chalk.gray(s), s => chalk.gray(s)],
    [s => chalk.gray(s), s => chalk.gray(s)],
  ];

  const maxLeftCol = Math.max(...leftCol.map(c => c.length));
  const maxRightCol = Math.max(...rightCol.map(c => c.length));

  if (leftCol.length !== rightCol.length) {
    throw new Error('Formatting error: columns different height');
  }

  const tableLines = leftCol.map((leftCell, rowNum) => {
    const [formatLeft, formatRight] = headerFormatters[rowNum] ?? [(s: string) => s, (s: string) => s];

    return `${formatLeft(leftCell.padStart(maxLeftCol))} | ${formatRight(rightCol[rowNum].padEnd(maxRightCol))}`;
  });

  return `${[
    chalk.gray(
      '-----------------------------------------',
      'Watch Mode Parcel Ignore Assertion Failure:',
      '-----------------------------------------'
    ),
    chalk.red(`<${expectedPath}> ` + chalk.bold('would not have been ignored by Parcel Watcher')),
    chalk.gray(chalk.bold('Note:'), 'Assertion should specify path relative to current working directory,'),
    chalk.gray('      but code should give path to ParcelWatcher relative to', chalk.bold('watchDirectory')),
    '',
    chalk.gray(chalk.bold('watchDirectory:'), watchDirectory),
    '',
    '',
    ...tableLines,
    '',
    chalk.gray(
      '----------------------------------------------------',
      'Raw Error (from Jest):',
      '---------------------------------------------------'
    ),
  ].join('\n')}\n${jestErrorMessage}`;
};

/**
 * Format a readable error message to print when the assertion fails, so that
 * the developer can immediately see which path was expected to trigger the rebuild.
 *
 * Since we're using auto-assertions, this makes for much more readable errors
 * than the raw Jest message (which can be misleading because, e.g. if the assertion
 * is that `onWatchTriggered` was last called with the right path, but it wasn't,
 * then the Jest error message will misleadingly print the previous path).
 */
export const formatBuildTriggerErrorPrelude = (
  /** Absolute path */ path: string,
  expectedToBuild: boolean,
  jestErrorMessage: string
) => {
  const relPath = relative(process.cwd(), path);
  const should = `${expectedToBuild ? 'have' : 'not have'} triggered build`;
  const but = expectedToBuild ? 'it did not' : 'it did';
  return `${[
    chalk.gray('---------------------- Watch Mode Build Trigger Assertion Failure: ----------------------'),
    chalk.red(`<${relPath}>` + chalk.bold(` should ${should}, but ${but}.`)),
    `     Expected: ${chalk.green(expectedToBuild ? 'to trigger build' : 'not to trigger build')}`,
    `     Received: ${chalk.red(expectedToBuild ? 'did not trigger build' : 'triggered build')}`,
    chalk.gray(`Absolute Path: ${path}`),
    '',
    chalk.gray('-------------------------------- Raw Error (from Jest): --------------------------------'),
  ].join('\n')}\n${jestErrorMessage}`;
};
