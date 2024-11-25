import { ReactElement, useEffect, useLayoutEffect } from 'react';
import {
  ToolsAndLibrariesCards,
  Heading,
  CheckIcon,
  CallToAction,
  GitHubIcon,
  cn,
  InfoCard,
  Anchor,
  useData,
  ExploreMainProductCards,
} from '@theguild/components';

import { DevExCards } from './dev-ex-cards';
import { Page } from './page';
import { Hero, HeroFeatures, HeroLinks } from './hero';
import { PluginsMarketplaceSearch, Plugin, getPluginsStaticProps } from './plugins-marketplace-search';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export { getPluginsStaticProps as getStaticProps };

export function IndexPage(): ReactElement {
  const plugins = useData() as Plugin[];

  useIsomorphicLayoutEffect(() => {
    // We add .light class to body to style the Headless UI
    // portal containing search results.
    document.body.classList.add('light');

    return () => {
      document.body.classList.remove('light');
    };
  }, []);

  return (
    <Page className="light mx-auto max-w-[90rem] overflow-hidden text-green-1000">
      <style global jsx>
        {`
          html {
            scroll-behavior: smooth;
          }
          body {
            background: #fff;
            --nextra-primary-hue: 191deg;
            --nextra-primary-saturation: 40%;
            --nextra-bg: 255, 255, 255;
          }
          .nextra-sidebar-footer {
            display: none;
          }
        `}
      </style>

      <Hero className="mx-4 max-sm:mt-2 md:mx-6">
        <Heading as="h1" size="xl" className="mx-auto max-w-3xl text-balance text-center">
          GraphQL Codegen
        </Heading>
        <p className="mx-auto w-[512px] max-w-[80%] text-balance text-center leading-6 text-green-800">
          Effortlessly generate comprehensive code from GraphQL schemas and operations, streamlining development across
          your tech stack.
        </p>
        <HeroFeatures>
          <li>
            <CheckIcon className="text-green-800" />
            End-to-end type safety
          </li>
          <li>
            <CheckIcon className="text-green-800" />
            Customizable
          </li>
          <li>
            <CheckIcon className="text-green-800" />
            Rich plugins ecosystem
          </li>
        </HeroFeatures>
        <HeroLinks>
          <CallToAction variant="primary-inverted" href="/docs/getting-started">
            Get started
          </CallToAction>
          <CallToAction variant="secondary-inverted" href="https://github.com/dotansimha/graphql-code-generator">
            <GitHubIcon className="size-6" />
            GitHub
          </CallToAction>
        </HeroLinks>
      </Hero>
      <ExploreMainProductCards className="max-lg:mx-4 max-lg:my-8" />
      <TypeSafeCards className="mx-4 md:mx-6" />
      <DevExCards className="mx-4 md:mx-6" />
      <PluginsMarketplaceSearch plugins={plugins} className="sm:mx-4 md:mx-6" />
      <ToolsAndLibrariesCards className="mx-4 md:mx-6" />
    </Page>
  );
}

function TypeSafeCards({ className }: { className?: string }) {
  return (
    <section className={cn('rounded-3xl bg-beige-100 p-4 pt-6 sm:py-24 md:px-6 md:py-[120px]', className)}>
      <div className="flex flex-wrap justify-center md:px-6 xl:px-16">
        <div className="w-full sm:mb-12 sm:px-8 xl:mb-0 xl:w-[400px] xl:px-0">
          <Heading as="h3" size="sm" className="text-balance">
            Generate Type-Safe GraphQL Client and Server Code
          </Heading>
          <p className="mt-6 text-green-800">
            Codegen enhances your GraphQL development with fully typed client and server code, generating robust,
            error-resistant solutions in seconds
          </p>
        </div>
        <InfoCard
          heading="No more mistakes"
          icon={<ChevronsIcon />}
          className="flex-1 px-0 sm:px-8 sm:py-0 md:px-8 md:py-0"
        >
          Codegen ensures your resolvers and client code are compliant with your GraphQL Schema.
        </InfoCard>
        <InfoCard
          heading="Easy customization"
          icon={<WritingIcon />}
          className="flex-1 basis-full border-beige-400 px-0 sm:basis-0 sm:border-l sm:px-8 sm:py-0 md:px-8 md:py-0"
        >
          Tailor the output that you need with community plugins or write{' '}
          <Anchor
            href="/docs/custom-codegen/plugin-structure"
            className="hive-focus -mx-1 -my-0.5 rounded px-1 py-0.5 underline hover:text-blue-700"
          >
            your own plugins
          </Anchor>{' '}
          to generate custom outputs matching your needs.
        </InfoCard>
      </div>
    </section>
  );
}

function ChevronsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23 12L15.929 19.071L14.515 17.657L20.172 12L14.515 6.34302L15.929 4.92902L23 12ZM3.828 12L9.485 17.657L8.071 19.071L1 12L8.071 4.92902L9.485 6.34302L3.828 12Z" />
    </svg>
  );
}

function WritingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="currentColor" {...props}>
      <path d="M6.414 15.9398L16.556 5.79778L15.142 4.38378L5 14.5258V15.9398H6.414ZM7.243 17.9398H3V13.6968L14.435 2.26178C14.6225 2.07431 14.8768 1.96899 15.142 1.96899C15.4072 1.96899 15.6615 2.07431 15.849 2.26178L18.678 5.09078C18.8655 5.27831 18.9708 5.53262 18.9708 5.79778C18.9708 6.06294 18.8655 6.31725 18.678 6.50478L7.243 17.9398ZM3 19.9398H21V21.9398H3V19.9398Z" />
    </svg>
  );
}
