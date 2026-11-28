import { fileURLToPath } from 'node:url';
import ts from 'typescript';

/**
 * Lists the options the docs show for a plugin's config type: every property, inherited ones
 * included, except those tagged `@ignore`. Reads the TypeScript source, so an option added to
 * `config.ts` is listed before the docs schema is regenerated.
 *
 * e.g. `{ file: '<repo>/packages/plugins/typescript/operations/src/config.ts', typeName: 'TypeScriptDocumentsPluginConfig' }`
 * → `['arrayInputCoercion', 'immutableTypes', …, 'avoidOptionals', …]`
 */
export function getDocumentedOptions({
  file,
  typeName,
}: {
  file: string;
  typeName: string;
}): string[] {
  // Resolves workspace packages (e.g. `@graphql-codegen/visitor-plugin-common`) to their sources.
  const tsconfigPath = fileURLToPath(new URL('../../../../tsconfig.build.json', import.meta.url));
  const tsconfig = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(
    tsconfig.config,
    ts.sys,
    fileURLToPath(new URL('../../../../', import.meta.url)),
  );
  const program = ts.createProgram({ rootNames: [file], options: { ...options, noEmit: true } });
  const sourceFile = program.getSourceFile(file);
  if (!sourceFile) {
    throw new Error(`Cannot read ${file}`);
  }
  const declaration = sourceFile.statements.find(
    statement => ts.isInterfaceDeclaration(statement) && statement.name.text === typeName,
  );
  if (!declaration || !ts.isInterfaceDeclaration(declaration)) {
    throw new Error(`${file} declares no interface named ${typeName}`);
  }
  const checker = program.getTypeChecker();
  return checker
    .getPropertiesOfType(checker.getTypeAtLocation(declaration.name))
    .filter(property => !property.getJsDocTags(checker).some(tag => tag.name === 'ignore'))
    .map(property => property.getName());
}
