import { FC } from 'react';
import dynamic from 'next/dynamic';
import { FeatureList, HeroGradient, HeroIllustration } from '@theguild/components';
import { handlePushRoute, NPMBadge } from '@guild-docs/client';
import tw from 'twin.macro';

const LiveDemo = dynamic(() => import('../components/live-demo/LiveDemo'), { ssr: false });

const IndexPage: FC = () => {
  return (
    <>
      <HeroGradient
        title="Generate code from your GraphQL schema"
        description="Generate code from your GraphQL schema and operations with a simple CLI"
        link={{
          href: '/docs/getting-started',
          children: 'Try It Now',
          title: 'Get started with GraphQL Code Generator',
          onClick: e => handlePushRoute('/docs/getting-started', e),
        }}
        version={<NPMBadge name="@graphql-codegen/cli" />}
        colors={['#1dbbff', '#ee1cd9']}
        image={{
          className: 'no-right',
          src: '/assets/illustrations/gql-codegen-cover.svg',
          alt: 'Illustration',
        }}
        wrapperProps={{
          style: { marginTop: 12 },
        }}
      />

      <div css={[tw`hidden lg:block`]}>
        <LiveDemo />
      </div>

      <HeroIllustration
        title="Generate Code Instantly"
        description="Generate code from your GraphQL schema and GraphQL operations with a single function call regardless of your environment or code format."
        image={{
          src: '/assets/illustrations/gql-generate-code-illustration.svg',
          alt: 'Illustration',
        }}
        flipped
      />

      <HeroIllustration
        title="Customize Easily"
        description="Generate code from your GraphQL schema and GraphQL operations with a single function call regardless of your environment or code format"
        image={{
          src: '/assets/illustrations/gql-watch-for-changes-illustration.svg',
          alt: 'Customize Easily',
        }}
      />
    </>
  );
};

export default IndexPage;
