import { ReactElement } from 'react';
import { HeroGradient, HeroIllustration, NPMBadge } from '@theguild/components';
import dynamic from 'next/dynamic';
import gqlCodegenCover from '../../public/assets/illustrations/gql-codegen-cover.svg';
import gqlGenerateCodeIllustration from '../../public/assets/illustrations/gql-generate-code-illustration.svg';
import gqlWatchForChangesIllustration from '../../public/assets/illustrations/gql-watch-for-changes-illustration.svg';

const LiveDemo = dynamic(() => import('@/components/live-demo/LiveDemo'), { ssr: false });

export function IndexPage(): ReactElement {
  return (
    <>
      <HeroGradient
        title="Generate code from your GraphQL schema"
        description="Generate code from your GraphQL schema and operations with a simple CLI"
        link={{
          href: '/docs/getting-started',
          children: 'Try It Now',
          title: 'Get started with GraphQL Code Generator',
        }}
        version={<NPMBadge name="@graphql-codegen/cli" />}
        colors={['#1dbbff', '#ee1cd9']}
        image={{
          src: gqlCodegenCover,
          loading: 'eager',
          placeholder: 'empty',
          alt: 'Illustration',
        }}
      />

      <LiveDemo />

      <HeroIllustration
        title="Generate Code Instantly"
        description="Generate code from your GraphQL schema and GraphQL operations with a single function call regardless of your environment or code format."
        image={{
          src: gqlGenerateCodeIllustration,
          loading: 'eager',
          placeholder: 'empty',
          alt: 'Illustration',
          className: 'max-h-[16rem]',
        }}
        className="[&>div]:max-w-6xl"
        flipped
      />

      <HeroIllustration
        title="Customize Easily"
        description="Generate code from your GraphQL schema and GraphQL operations with a single function call regardless of your environment or code format"
        image={{
          src: gqlWatchForChangesIllustration,
          loading: 'eager',
          placeholder: 'empty',
          alt: 'Customize Easily',
          className: 'max-h-[16rem]',
        }}
        className="[&>div]:max-w-6xl"
      />
    </>
  );
}
