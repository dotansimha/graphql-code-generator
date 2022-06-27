import { getPackagesData } from '@guild-docs/server/npm';
import { packageList } from './plugins';
import { transformDocs } from './transform';
import { compileMdx } from 'nextra/compile';

export const getNpmInfo = (packageName: string) => async () => {
  const [pluginData] = await getPackagesData({
    idSpecific: packageName,
    packageList: packageList,
  });
  const generatedDocs = transformDocs();

  const source = generatedDocs.docs[packageName] || pluginData.stats?.readme?.replace('ERROR: No README data found!', '') || '';
  const mdx = await compileMdx(source, {
    outputFormat: 'function-body',
    jsx: false,
  });

  return {
    props: {
      // We add an `ssg` field to the page props,
      // which will be provided to the Nextra `useSSG` hook.
      ssg: {
        pluginData: {
          ...pluginData,
          compiledSource: mdx.result,
        },
      },
    },
    // The page will be considered as stale and regenerated every 24 hours.
    revalidate: 60 * 60 * 24,
  };
};
