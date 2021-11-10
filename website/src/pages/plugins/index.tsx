import { FC, useMemo } from 'react';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { compareDesc } from 'date-fns';
import { handlePushRoute, PackageInstall, RemoteGHMarkdown } from '@guild-docs/client';
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
          modal: {
            header: {
              image: rawPlugin.iconUrl
                ? {
                    src: rawPlugin.iconUrl,
                    alt: rawPlugin.title,
                  }
                : undefined,
              description: {
                href: `https://npmjs.com/package/${rawPlugin.npmPackage}`,
                children: `${rawPlugin.npmPackage} on npm`,
                title: `${rawPlugin.npmPackage} on NPM`,
                target: '_blank',
                rel: 'noopener noreferrer',
              },
            },
            content: (
              <>
                <PackageInstall packages={rawPlugin.npmPackage} />
                <RemoteGHMarkdown
                  directory={rawPlugin.stats?.repositoryDirectory}
                  repo={rawPlugin.stats?.repositoryLink}
                  content={rawPlugin.content}
                />
              </>
            ),
          },
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
        .filter(i => i.raw.stats?.weeklyNPMDownloads && i.raw.npmPackage !== '@envelop/core')
        .sort((a, b) => {
          const aMonthlyDownloads = a.raw.stats?.weeklyNPMDownloads || 0;
          const bMonthlyDownloads = b.raw.stats?.weeklyNPMDownloads || 0;

          return bMonthlyDownloads - aMonthlyDownloads;
        }),
    [marketplaceItems]
  );

  // const randomThirdParty = useMemo(() => {
  //   if (marketplaceItems && marketplaceItems.length > 0) {
  //     return [...marketplaceItems]
  //       .filter(item => item.raw.npmPackage !== '@envelop/core')
  //       .sort(() => 0.5 - Math.random())
  //       .slice(0, 3);
  //   }

  //   return [];
  // }, [marketplaceItems]);

  return (
    <>
      <Head>
        <title>Plugin Hub</title>
      </Head>

      {/* <CardsColorful
            cards={randomThirdParty.map(item => ({
              title: item.title,
              description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
              category: 'Discover new Envelop plugins!',
              link: {
                href: `https://www.npmjs.com/package/${item.raw.npmPackage}`,
                target: '_blank',
                rel: 'noopener norefereer',
                title: 'Learn more',
              },
              color: '#3547E5',
            }))}
          /> */}
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
          pagination: 8,
        }}
        secondaryList={{
          title: 'Recently Updated',
          items: recentlyUpdatedItems,
          placeholder: '0 items',
          pagination: 8,
        }}
        queryList={{
          title: 'Search Results',
          items: marketplaceItems,
          placeholder: 'No results for {query}',
          pagination: 8,
        }}
      />
    </>
  );
};

export default Marketplace;
