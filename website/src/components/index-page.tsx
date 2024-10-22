import { ReactElement, useEffect, useLayoutEffect } from 'react';
import {
  GetYourAPIGameRightSection,
  ToolsAndLibrariesCards,
  Heading,
  CheckIcon,
  CallToAction,
  GitHubIcon,
  Stud,
  CodegenIcon,
} from '@theguild/components';

import { DevExCards } from './dev-ex-cards';
import { Page } from './page';
import { Hero, HeroFeatures, HeroLinks } from './hero';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function IndexPage(): ReactElement {
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
          }
          #__next {
            --nextra-primary-hue: 191deg;
            --nextra-primary-saturation: 40%;
            --nextra-bg: 255, 255, 255;
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
            <CheckIcon />
            End-to-end type safety
          </li>
          <li>
            <CheckIcon />
            Customizable
          </li>
          <li>
            <CheckIcon />
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

      <DevExCards className="mx-4 md:mx-6" />
      <ToolsAndLibrariesCards className="mx-4 md:mx-6" />
      <GetYourAPIGameRightSection className="mx-4 sm:mb-6 md:mx-6" />
    </Page>
  );
}
