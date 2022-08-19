import { Source } from '@graphql-tools/utils';
import { SourceWithOperations, OperationOrFragment } from '@graphql-codegen/gql-tag-operations';
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';

export type BuildNameFunction = (type: OperationDefinitionNode | FragmentDefinitionNode) => string;

export function processSources(sources: Array<Source>, buildName: BuildNameFunction) {
  const sourcesWithOperations: Array<SourceWithOperations> = [];

  for (const originalSource of sources) {
    const source = fixLinebreaks(originalSource);
    const { document } = source;
    const operations: Array<OperationOrFragment> = [];

    for (const definition of document?.definitions ?? []) {
      if (definition?.kind !== `OperationDefinition` && definition?.kind !== 'FragmentDefinition') continue;

      if (definition.name?.kind !== `Name`) continue;

      operations.push({
        initialName: buildName(definition),
        definition,
      });
    }

    if (operations.length === 0) continue;

    sourcesWithOperations.push({
      source,
      operations,
    });
  }

  return sourcesWithOperations;
}

/**
 * https://github.com/dotansimha/graphql-code-generator/issues/7362
 *
 * Source file is read by @graphql/tools using fs.promises.readFile,
 * which means that the linebreaks are read as-is and the result will be different
 * depending on the OS: it will contain LF (\n) on Linux/MacOS and CRLF (\r\n) on Windows.
 *
 * In most scenarios that would be OK. However, front-end preset is using the resulting string
 * as a TypeScript type. Which means that the string will be compared against a template literal,
 * for example:
 *
 * <pre><code>
 * `
 * query a {
 *    a
 *  }
 * ` === '\n query a {\n    a\n  }\n '
 * </code></pre>
 *
 * According to clause 12.8.6.2 of ECMAScript Language Specification
 * (https://tc39.es/ecma262/#sec-static-semantics-trv),
 * when comparing strings, JavaScript doesn't care which linebreaks does the source file contain,
 * any linebreak (CR, LF or CRLF) is LF from JavaScript standpoint
 * (otherwise the result of the above comparison would be OS-dependent, which doesn't make sense).
 *
 * Therefore gql-tag-operation would break on Windows as it would generate
 *
 * '\r\n query a {\r\n    a\r\n  }\r\n '
 *
 * which is NOT equal to
 *
 * <pre><code>
 * `
 * query a {
 *    a
 *  }
 * `
 * </code></pre>
 *
 * Therefore we need to replace \r\n with \n in the string.
 *
 * @param source
 */
function fixLinebreaks(source: Source) {
  const fixedSource = { ...source };

  fixedSource.rawSDL = source.rawSDL.replace(/\r\n/g, '\n');

  return fixedSource;
}
