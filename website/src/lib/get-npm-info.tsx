import { PACKAGES } from './plugins';
import { compileMdx } from 'nextra/compile';
import { transformDocs } from './transform';

export const getNpmInfo = (identifier: string) =>
  // Passing packageName for `getStaticProps` of mdx files in plugins directory
  async function getStaticProps() {
    const plugin = PACKAGES.find(p => p.identifier === identifier);
    if (!plugin) {
      throw new Error(`Unknown "${identifier}" plugin identifier`);
    }
    const { npmPackage } = plugin
    const encodedName = encodeURIComponent(npmPackage);
    const response = await fetch(`https://registry.npmjs.org/${encodedName}`);
    const { readme, time } = await response.json();

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
          modified: time.modified,
          compiledSource: mdx.result,
        },
      },
      // The page will be considered as stale and regenerated every 24 hours.
      revalidate: 60 * 60 * 24,
    };
  };
