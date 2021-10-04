import {FeatureList, HeroGradient, HeroIllustration} from '@theguild/components';
import {handlePushRoute, NPMBadge} from '@guild-docs/client';

export default function Index() {
    return (
        <>
            <HeroGradient
                title="Generate code from your GraphQL schema"
                description="Generate code from your GraphQL schema and operations with a simple CLI"
                link={{
                    href: '/docs',
                    children: 'Try It Now',
                    title: 'Get started with GraphQL Code Generator',
                    onClick: e => handlePushRoute('/docs', e)
                }}
                version={<NPMBadge name="@graphql-codegen/cli"/>}
                colors={['#1DBBFF', '#EE1CD9']}
                image={{
                    src: '/static/img/illustrations/gql-codegen-cover.svg',
                    alt: 'Illustration'
                }}
            />

            <HeroIllustration
                title="Generate Code Instantly"
                description={`Generate code from your GraphQL schema and GraphQL operations with a single function call regardless of your environment or code format.`}
                image={{
                    src: '/static/img/illustrations/gql-generate-code-illustration.svg',
                    alt: 'Illustration'
                }}
                flipped
            />

            <HeroIllustration
                title="Watch For Changes"
                description={`Watch for changes in your GraphQL schema and operations, and automatically generate code as you go. Codegen easily integrates into your development workflow.`}
                image={{
                    src: '/static/img/illustrations/gql-watch-for-changes-illustration.svg',
                    alt: 'Illustration'
                }}
            />

            <FeatureList
                title="Customize Easily"
                titleDescription="Generate code from your GraphQL schema and GraphQL operations with a single function call regardless of your environment or code format"
                items={[
                    {
                        title: 'Generate Resolvers',
                        description:
                            'Generate code from your GraphQL schema and GraphQL operations with a single function call regardless of your environment or code format.',
                        image: {
                            src: '/static/img/gear.svg',
                            alt: 'Illustration'
                        }
                    },
                    {
                        title: 'Watch For Changes',
                        description:
                            'Watch for changes in your GraphQL schema and operations, and automatically generate code as you go. Codegen easily integrates into your development workflow.',
                        image: {
                            src: '/static/img/eye.svg',
                            alt: 'Illustration'
                        }
                    },
                    {
                        title: 'And Much More...',
                        description:
                            'You can generate your resolvers\' signatures, dump schemas, model types, query builders, React Hooks, Angular Services, and much more!',
                        image: {
                            src: '/static/img/more-options.svg',
                            alt: 'more'
                        }
                    }
                ]}
            />
        </>
    );
}
