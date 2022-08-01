import { ReactElement, useMemo } from 'react';
import { useSSG } from 'nextra/ssg';
import { compareDesc } from 'date-fns';
import { handlePushRoute } from '@guild-docs/client';
import { CompiledMDX } from '@guild-docs/server';
import { PackageWithStats } from '@guild-docs/server/npm';
import { MarketplaceSearch } from '@theguild/components';
import { IMarketplaceItemProps } from '@theguild/components/dist/types/components';
import Markdown from '@/components/ui/Markdown';
import { ALL_TAGS } from '@/lib/plugins';
import { CategoryToPackages } from '@/category-to-packages.mjs';

type MarketplaceProps = {
  data: (PackageWithStats & {
    description: CompiledMDX;
    content: CompiledMDX;
  })[];
};

const categoryEntries = Object.entries(CategoryToPackages);

export const Plugins = (): ReactElement => {
  const { data } = useSSG() as MarketplaceProps;

  const marketplaceItems: (IMarketplaceItemProps & { raw: PackageWithStats })[] = useMemo(
    () =>
      data.map<IMarketplaceItemProps & { raw: PackageWithStats }>(plugin => {
        const [category] = categoryEntries.find(([, packageNames]) => packageNames.includes(plugin.identifier)) || [];
        const linkHref = `/plugins/${category}/${plugin.identifier}`;
        return {
          raw: plugin,
          tags: plugin.tags,
          title: plugin.title,
          link: {
            href: linkHref,
            title: `${plugin.title} plugin details`,
            onClick: ev => handlePushRoute(linkHref, ev),
          },
          description: <Markdown content={plugin.description} />,
          update: plugin.stats?.modifiedDate || new Date().toISOString(),
          image: plugin.iconUrl
            ? {
                height: 60,
                width: 60,
                src: plugin.iconUrl,
                alt: plugin.title,
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
    <MarketplaceSearch
      title="Explore Plugins"
      tagsFilter={ALL_TAGS}
      placeholder="Find plugins..."
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
  );
};
