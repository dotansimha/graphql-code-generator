import { PACKAGES } from './plugins';
import { compileMdx } from 'nextra/compile';
import { transformDocs } from './transform';

export const getNpmInfo = (packageName: string) =>
  // Passing packageName for `getStaticProps` of mdx files in plugins directory
  async function getStaticProps() {
    const encodedName = encodeURIComponent(packageName);
    const response = await fetch(`https://registry.npmjs.org/${encodedName}`);
    const { readme, time } = await response.json();

    const generatedDocs = transformDocs();
    const source = generatedDocs.docs[packageName] || readme || '';

    const { npmPackage, title } = PACKAGES.find(p => p.identifier === packageName) || {};

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
          title,
          modified: time.modified,
          compiledSource: mdx.result
        },
      },
      // The page will be considered as stale and regenerated every 24 hours.
      revalidate: 60 * 60 * 24,
    };
  };
