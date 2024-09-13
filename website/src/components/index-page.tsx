import { ReactElement } from 'react';
import { HeroGradient, HeroIllustration, NPMBadge } from '@theguild/components';
import gqlCodegenCover from '../../public/assets/illustrations/gql-codegen-cover.svg';
import gqlGenerateCodeIllustration from '../../public/assets/illustrations/gql-generate-code-illustration.svg';
import gqlWatchForChangesIllustration from '../../public/assets/illustrations/gql-watch-for-changes-illustration.svg';

export function IndexPage(): ReactElement {
  return (
    <>
      <HeroGradient
        title="Generate Type-Safe GraphQL Client and Server Code"
        description="Supercharge Your GraphQL Development Flow with Fully Typed Code in Seconds."
        link={[
          {
            href: '/docs/getting-started',
            children: 'Get Started with Client and Server',
            title: 'Get started with GraphQL Code Generator',
          },
        ]}
        colors={['#1dbbff', '#ee1cd9']}
        image={{
          src: gqlCodegenCover,
          loading: 'eager',
          placeholder: 'empty',
          alt: 'Illustration',
        }}
      />

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
