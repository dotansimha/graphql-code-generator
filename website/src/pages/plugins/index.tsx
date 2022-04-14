import { FC, useMemo } from 'react';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { compareDesc } from 'date-fns';
import { handlePushRoute } from '@guild-docs/client';
import { buildMultipleMDX, CompiledMDX } from '@guild-docs/server';
import { getPackagesData, PackageWithStats } from '@guild-docs/server/npm';
import { MarketplaceSearch } from '@theguild/components';
import { IMarketplaceItemProps } from '@theguild/components/dist/types/components';

import Markdown from '../../components/ui/Markdown';
import { ALL_TAGS, packageList } from '../../lib/plugins';

type MarketplaceProps = {
  data: (PackageWithStats & {
    description: CompiledMDX;
    content: CompiledMDX;
  })[];
};

export const getStaticProps: GetStaticProps<MarketplaceProps> = async () => {
  const pluginsData = await getPackagesData({ packageList });

  const data = await Promise.all(
    pluginsData.map(async plugin => {
      const [description, content] = await buildMultipleMDX([
        `${plugin.stats?.version || ''}\n\n${plugin.stats?.description || ''}`,
        plugin.readme || plugin.stats?.readme || '',
      ]);

      return {
        ...plugin,
        description,
        content,
      };
    })
  );

  return {
    props: {
      data,
    },
    // Revalidate at most once every 1 hour
    revalidate: 60 * 60,
  };
};

const Marketplace: FC<MarketplaceProps> = ({ data }) => {
  const marketplaceItems: (IMarketplaceItemProps & { raw: PackageWithStats })[] = useMemo(
    () =>
      data.map<IMarketplaceItemProps & { raw: PackageWithStats }>(rawPlugin => {
        const linkHref = `/plugins/${rawPlugin.identifier}`;
        return {
          raw: rawPlugin,
          tags: rawPlugin.tags,
          title: rawPlugin.title,
          link: {
            href: linkHref,
            title: `${rawPlugin.title} plugin details`,
            onClick: ev => handlePushRoute(linkHref, ev),
          },
          description: <Markdown content={rawPlugin.description} />,
          update: rawPlugin.stats?.modifiedDate || new Date().toISOString(),
          image: rawPlugin.iconUrl
            ? {
                height: 60,
                width: 60,
                src: rawPlugin.iconUrl,
                alt: rawPlugin.title,
              }
            : undefined,
        };
      }),
    [data]
  );

  const recentlyUpdatedItems = useMemo(
    () => [...marketplaceItems].sort((a, b) => compareDesc(new Date(a.update), new Date(b.update))),
    [marketplaceItems]
  );

  const trendingItems = useMemo(
    () =>
      marketplaceItems
        .filter(i => i.raw.stats?.weeklyNPMDownloads)
        .sort((a, b) => {
          const aMonthlyDownloads = a.raw.stats?.weeklyNPMDownloads || 0;
          const bMonthlyDownloads = b.raw.stats?.weeklyNPMDownloads || 0;

          return bMonthlyDownloads - aMonthlyDownloads;
        }),
    [marketplaceItems]
  );

  return (
    <>
      <Head>
        <title>Plugin Hub</title>
      </Head>
      <MarketplaceSearch
        title="Explore Plugin Hub"
        tagsFilter={ALL_TAGS as any as string[]}
        placeholder="Find plugins..."
        wrapperProps={{
          className: 'plugins-list',
        }}
        primaryList={{
          title: 'Trending',
          items: trendingItems,
          placeholder: '0 items',
          pagination: 10,
        }}
        secondaryList={{
          title: 'Recently Updated',
          items: recentlyUpdatedItems,
          placeholder: '0 items',
          pagination: 10,
        }}
        queryList={{
          title: 'Search Results',
          items: marketplaceItems,
          placeholder: 'No results for {query}',
          pagination: 10,
        }}
      />
    </>
  );
};

export default Marketplace;
