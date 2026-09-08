import * as path from 'path';
import { buildSchema, parse } from 'graphql';
import { CallExpression, Node, Project, SyntaxKind } from 'ts-morph';
import { ClientSideBaseVisitor } from '@graphql-codegen/visitor-plugin-common';

const noopSchema = buildSchema(`type Query { _: Int }`);

export type ClientPresetCodemodOptions = {
  /**
   * Glob pattern(s) of the source files to codemod. Prefix a pattern with `!` to exclude it,
   * the same way you would in the `documents` field of your codegen config.
   */
  include: string | string[];
  /**
   * Path of the directory `client-preset` writes its `graphql.ts` (and friends) artifact to.
   * Should be the same value as the `generates` key used for `preset: 'client'` in your codegen config.
   */
  artifactDirectory: string;
  /**
   * Name of the "graphql tag" function to look for.
   * @default 'graphql'
   */
  gqlTagName?: string;
  /**
   * Working directory used to resolve `include` and `artifactDirectory`.
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * When `true`, computes the changes but does not write them to disk.
   * @default false
   */
  dryRun?: boolean;
};

export type ClientPresetCodemodSkippedCallSite = {
  file: string;
  reason: string;
};

export type ClientPresetCodemodResult = {
  /** Absolute paths of the files that were changed (or would be changed, in `dryRun` mode). */
  changedFiles: string[];
  /** Call sites the codemod recognized but intentionally left untouched, with the reason why. */
  skippedCallSites: ClientPresetCodemodSkippedCallSite[];
};

/**
 * Rewrites `graphql(/* GraphQL *\/ \`query MyQuery { ... }\`)` call sites (as produced by
 * `client-preset`) into a direct `import { MyQueryDocument } from '<artifactDirectory>/graphql'`
 * plus a reference to that identifier.
 *
 * This performs, once at your convenience, the same transform that `client-preset`'s Babel plugin
 * (`@graphql-codegen/client-preset` → `babelOptimizerPlugin`) and `@graphql-codegen/client-preset-swc-plugin`
 * apply on every build, so bundlers can code-split/tree-shake `client-preset` documents without
 * either of those plugins wired into your build pipeline.
 */
export function runClientPresetCodemod(
  options: ClientPresetCodemodOptions,
): ClientPresetCodemodResult {
  const cwd = options.cwd ?? process.cwd();
  const gqlTagName = options.gqlTagName || 'graphql';
  const artifactDirectory = path.resolve(cwd, options.artifactDirectory);

  const visitor = new ClientSideBaseVisitor(noopSchema, [], {}, {});

  const project = new Project({ skipAddingFilesFromTsConfig: true });
  project.addSourceFilesAtPaths(options.include);

  const changedFiles: string[] = [];
  const skippedCallSites: ClientPresetCodemodSkippedCallSite[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    const namesToImport = new Set<string>();

    const callExpressions = sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((callExpression): callExpression is CallExpression => {
        const expression = callExpression.getExpression();
        return Node.isIdentifier(expression) && expression.getText() === gqlTagName;
      });

    for (const callExpression of callExpressions) {
      const [argument] = callExpression.getArguments();
      if (argument == null) {
        continue;
      }

      if (!Node.isNoSubstitutionTemplateLiteral(argument)) {
        // `client-preset` documents reference fragments by name (`...MyFragment`), they never
        // interpolate other documents into the template literal, so this call site isn't ours to
        // touch (or was already codemodded into something else).
        skippedCallSites.push({
          file: filePath,
          reason:
            'the first argument is not a plain template literal (it may contain interpolations)',
        });
        continue;
      }

      let document;
      try {
        document = parse(argument.getLiteralText());
      } catch (error) {
        skippedCallSites.push({
          file: filePath,
          reason: `failed to parse the GraphQL document: ${error instanceof Error ? error.message : String(error)}`,
        });
        continue;
      }

      const [firstDefinition] = document.definitions;
      if (
        firstDefinition == null ||
        (firstDefinition.kind !== 'FragmentDefinition' &&
          firstDefinition.kind !== 'OperationDefinition')
      ) {
        continue;
      }

      if (firstDefinition.name == null) {
        skippedCallSites.push({
          file: filePath,
          reason: 'anonymous operations cannot be codemodded, give it a name',
        });
        continue;
      }

      const generatedName =
        firstDefinition.kind === 'OperationDefinition'
          ? visitor.getOperationVariableName(firstDefinition)
          : visitor.getFragmentVariableName(firstDefinition);

      callExpression.replaceWithText(generatedName);
      namesToImport.add(generatedName);
    }

    if (namesToImport.size === 0) {
      continue;
    }

    addNamedImport(sourceFile, getRelativeImportPath(filePath, artifactDirectory), [
      ...namesToImport,
    ]);
    changedFiles.push(filePath);
  }

  if (!options.dryRun) {
    project.saveSync();
  }

  return { changedFiles, skippedCallSites };
}

function addNamedImport(
  sourceFile: ReturnType<Project['getSourceFiles']>[number],
  moduleSpecifier: string,
  names: string[],
): void {
  const existingImport = sourceFile.getImportDeclaration(
    importDeclaration => importDeclaration.getModuleSpecifierValue() === moduleSpecifier,
  );

  if (existingImport == null) {
    sourceFile.addImportDeclaration({ moduleSpecifier, namedImports: names });
    return;
  }

  const existingNames = new Set(
    existingImport.getNamedImports().map(namedImport => namedImport.getName()),
  );
  const newNames = names.filter(name => !existingNames.has(name));
  if (newNames.length > 0) {
    existingImport.addNamedImports(newNames);
  }
}

function getRelativeImportPath(
  fileFullPath: string,
  artifactDirectory: string,
  fileToRequire = 'graphql',
): string {
  const relative = path.relative(path.dirname(fileFullPath), artifactDirectory);
  const relativeReference = relative.length === 0 || !relative.startsWith('.') ? './' : '';
  const platformSpecificPath = relativeReference + path.join(relative, fileToRequire);
  // ensure windows paths are written as unix paths
  return platformSpecificPath.split(path.sep).join(path.posix.sep);
}
