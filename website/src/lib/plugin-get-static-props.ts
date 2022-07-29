import { PACKAGES } from '@/lib/plugins';
import { compileMdx } from 'nextra/compile';
import { transformDocs } from '@/lib/transform';
import { fetchNpmInfo } from '@/lib/fetch-npm-info';
import { parse } from 'node:path';

// Can't be used in plugin.tsx due incorrect tree shaking:
// Module not found: Can't resolve 'fs'
export const pluginGetStaticProps = (fileName: string) => async () => {
  const identifier = parse(fileName).name;
  const plugin = PACKAGES.find(p => p.identifier === identifier);
  if (!plugin) {
    throw new Error(`Unknown "${identifier}" plugin identifier`);
  }
  const { npmPackage } = plugin;
  const { readme, updatedAt } = await fetchNpmInfo(npmPackage);

  const generatedDocs = transformDocs();
  const source = generatedDocs.docs[identifier] || readme.replaceAll('```yml', '```yaml') || '';

  const mdx = await compileMdx(source, {
    outputFormat: 'function-body',
    jsx: false,
  });

  return {
    props: {
      // We add an `ssg` field to the page props,
      // which will be provided to the Nextra `useSSG` hook.
      ssg: {
        npmPackage,
        updatedAt,
        compiledSource: mdx.result,
      },
    },
    // The page will be considered as stale and regenerated every 24 hours.
    revalidate: 60 * 60 * 24,
  };
};
