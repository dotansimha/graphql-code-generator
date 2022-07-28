import { ReactElement, useMemo } from 'react';
import { useSSG } from 'nextra/ssg';
import { compareDesc } from 'date-fns';
import { handlePushRoute } from 'guild-docs';
import { MarketplaceSearch } from '@theguild/components';
import { IMarketplaceItemProps } from '@theguild/components/dist/types/components';
import { ALL_TAGS } from '@/lib/plugins';

type PluginData = {
  title: string;
  readme: string;
  created: string;
  modified: string;
  description: string;
  linkHref: string;
  weeklyNPMDownloads: number;
  iconUrl: string;
  tags: string[];
};

export const Plugins = (): ReactElement => {
  const plugins = useSSG() as PluginData[];

  const marketplaceItems: IMarketplaceItemProps[] = useMemo(
    () =>
      plugins.map(plugin => ({
        title: plugin.title,
        description: plugin.description,
        tags: plugin.tags,
        link: {
          href: plugin.linkHref,
          title: `${plugin.title} plugin details`,
          onClick: ev => handlePushRoute(plugin.linkHref, ev),
        },
        update: plugin.modified || new Date().toISOString(),
        image: plugin.iconUrl
          ? {
              height: 60,
              width: 60,
              src: plugin.iconUrl,
              alt: plugin.title,
            }
          : undefined,
        weeklyNPMDownloads: plugin.weeklyNPMDownloads,
      })),
    [plugins]
  );

  const recentlyUpdatedItems = useMemo(
    () => [...marketplaceItems].sort((a, b) => compareDesc(new Date(a.update), new Date(b.update))),
    [marketplaceItems]
  );

  const trendingItems = useMemo(
    () =>
      marketplaceItems
        .filter(i => i.weeklyNPMDownloads)
        .sort((a, b) => {
          const aMonthlyDownloads = a.weeklyNPMDownloads || 0;
          const bMonthlyDownloads = b.weeklyNPMDownloads || 0;

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
