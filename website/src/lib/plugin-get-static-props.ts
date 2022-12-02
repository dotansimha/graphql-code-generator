import { PACKAGES } from '@/lib/plugins';
import { compileMdx } from 'nextra/compile';
import { transformDocs } from '@/lib/transform';
import { fetchPackageInfo } from '@theguild/components';
import { parse } from 'node:path';
import { format } from 'date-fns';

// Can't be used in plugin.tsx due incorrect tree shaking:
// Module not found: Can't resolve 'fs'
export const pluginGetStaticProps = (fileName: string) => async () => {
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
      unstable_defaultShowCopyCode: true,
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

### Installation
`
    ),
  ]);

  return {
    props: {
      ssg: {
        npmPackage,
        compiledSource: mdx.result,
        compiledHeader: mdxHeader.result,
      },
    },
    // The page will be considered as stale and regenerated every 24 hours.
    revalidate: 60 * 60 * 24,
  };
};
