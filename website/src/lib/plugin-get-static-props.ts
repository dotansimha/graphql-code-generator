import { parse } from 'node:path';
import { fetchPackageInfo } from '@theguild/components';
import { defaultRemarkPlugins } from '@theguild/components/next.config';
import { format } from 'date-fns';
import { compileMdx } from 'nextra/compile';
import { PACKAGES } from '@/lib/plugins';
import { transformDocs } from '@/lib/transform';

// Can't be used in plugin.tsx due incorrect tree shaking:
// Module not found: Can't resolve 'fs'
export const pluginGetStaticProps =
  (fileName: string, { isDev = true, hasOperationsNote = false, ...rest } = {}) =>
  async () => {
    const unknownOptions = Object.keys(rest);
    if (unknownOptions.length) {
      throw new Error(`Unknown options "${unknownOptions}"`);
    }
    const identifier = parse(fileName).name;
    const plugin = PACKAGES[identifier];
    if (!plugin) {
      throw new Error(`Unknown "${identifier}" plugin identifier`);
    }
    const { npmPackage } = plugin;
    const { readme, updatedAt } = await fetchPackageInfo(npmPackage);

    const generatedDocs = transformDocs();
    const source = generatedDocs.docs[identifier] || readme.replaceAll('```yml', '```yaml') || '';
    const title = plugin.title ?? '';

    const [mdx, mdxHeader] = await Promise.all([
      compileMdx(source, {
        defaultShowCopyCode: true,
      }),
      compileMdx(
        `
      # ${title}
|Package name|Weekly Downloads|Version|License|Updated|
|-|-|-|-|-|
|[\`${npmPackage}\`](https://npmjs.com/package/${npmPackage})|![Downloads](https://badgen.net/npm/dw/${npmPackage} "Downloads")|![Version](https://badgen.net/npm/v/${npmPackage} "Version")|![License](https://badgen.net/npm/license/${npmPackage} "License")|${format(
          new Date(updatedAt),
          'MMM do, yyyy'
        )}|

## Installation

\`\`\`sh npm2yarn
npm i ${isDev ? '-D ' : ''}${npmPackage}
\`\`\`

${
  hasOperationsNote
    ? `
<Callout type='warning'>
**Usage Requirements**
In order to use this GraphQL Codegen plugin, please make sure that you have GraphQL operations (\`query\` / \`mutation\` / \`subscription\` and \`fragment\`) set as \`documents: …\` in your \`codegen.yml\`.

Without loading your GraphQL operations (\`query\`, \`mutation\`, \`subscription\` and \`fragment\`), you won't see any change in the generated output.
</Callout>
`
    : ''
}
`,
        {
          mdxOptions: {
            remarkPlugins: defaultRemarkPlugins,
          },
        }
      ),
    ]);

    return {
      props: {
        ssg: {
          compiledSource: mdx.result,
          compiledHeader: mdxHeader.result,
        },
      },
    };
  };
