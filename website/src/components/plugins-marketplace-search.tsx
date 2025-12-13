import { useMemo } from 'react';
import { IMarketplaceSearchProps, MarketplaceSearch } from '@theguild/components';
import { compareDesc } from 'date-fns';
import { CategoryToPackages } from '@/category-to-packages.mjs';
import { ALL_TAGS, Icon, icons, PACKAGES } from '@/lib/plugins';
import { packagesInfo } from '@/lib/packages-info.generated';

export type Plugin = {
  title: string;
  readme: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  linkHref: string;
  weeklyNPMDownloads: number;
  icon: Icon | string;
  tags: string[];
};

export const getPluginsStaticProps = async () => {
  const categoryEntries = Object.entries(CategoryToPackages);

  const plugins: Plugin[] = Object.entries(PACKAGES).map(([identifier, { title, icon, tags }]) => {
    const packageInfo = packagesInfo[identifier as keyof typeof packagesInfo];
    if (!packageInfo) {
      throw new Error(`Unknown "${identifier}" plugin identifier`);
    }

    const { readme, createdAt, updatedAt, description, weeklyNPMDownloads = 0 } = packageInfo;

    const [category] = categoryEntries.find(([, pluginName]) => pluginName.includes(identifier)) || [];

    return {
      title,
      readme,
      createdAt,
      updatedAt,
      description,
      linkHref: `/plugins/${category}/${identifier}`,
      weeklyNPMDownloads,
      icon,
      tags,
    };
  });

  return {
    props: {
      // We add an `ssg` field to the page props,
      // which will be provided to the Nextra's `useData` hook.
      ssg: plugins,
    },
  };
};

export function PluginsMarketplaceSearch({
  className,
  plugins,
  colorScheme,
}: {
  plugins: Plugin[];
  className?: string;
  colorScheme?: IMarketplaceSearchProps['colorScheme'];
}) {
  const marketplaceItems = useMemo(
    () =>
      plugins.map(plugin => {
        const icon = icons[plugin.icon as Icon];
        return {
          title: plugin.title,
          description: plugin.description,
          tags: plugin.tags,
          link: {
            href: plugin.linkHref,
            title: `${plugin.title} plugin details`,
          },
          update: plugin.updatedAt,
          image: {
            src: icon || plugin.icon,
            placeholder: 'empty' as const,
            loading: 'eager' as const,
            alt: plugin.title,
          },
          weeklyNPMDownloads: plugin.weeklyNPMDownloads,
        };
      }),
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
      title="Explore Plugins & Presets"
      tagsFilter={ALL_TAGS}
      placeholder="Search..."
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
      className={className}
      colorScheme={colorScheme}
    />
  );
}
