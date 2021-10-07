import {FeatureList, HeroGradient, HeroIllustration} from '@theguild/components';
import {handlePushRoute, NPMBadge} from '@guild-docs/client';
import styles from './styles.module.css';
import dynamic from 'next/dynamic';
// @ts-ignore
import * as classnames from 'classnames';

const LiveDemo = dynamic(() => import('../components/live-demo/LiveDemo'), { ssr: false})

export default function Index() {
    return (
        <>
            <HeroGradient
                title="Generate code from your GraphQL schema"
                description="Generate code from your GraphQL schema and operations with a simple CLI"
                link={{
                    href: '/docs/getting_started',
                    children: 'Try It Now',
                    title: 'Get started with GraphQL Code Generator',
                    onClick: e => handlePushRoute('/docs', e)
                }}
                version={<NPMBadge name="@graphql-codegen/cli"/>}
                colors={['#1DBBFF', '#EE1CD9']}
                image={{
                    className: 'no-right',
                    src: '/assets/illustrations/gql-codegen-cover.svg',
                    alt: 'Illustration'
                }}
            />

            <div className={classnames(styles.liveDemo, styles.desktopOnly)}>
                <a id="live-demo" />
                <LiveDemo />
            </div>

            <HeroIllustration
                title="Generate Code Instantly"
                description={`Generate code from your GraphQL schema and GraphQL operations with a single function call regardless of your environment or code format.`}
                image={{
                    src: '/assets/illustrations/gql-generate-code-illustration.svg',
                    alt: 'Illustration'
                }}
                flipped
            />

            <HeroIllustration
                title="Watch For Changes"
                description={`Watch for changes in your GraphQL schema and operations, and automatically generate code as you go. Codegen easily integrates into your development workflow.`}
                image={{
                    src: '/assets/illustrations/gql-watch-for-changes-illustration.svg',
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
                            src: '/assets/gear.svg',
                            alt: 'Illustration'
                        }
                    },
                    {
                        title: 'Watch For Changes',
                        description:
                            'Watch for changes in your GraphQL schema and operations, and automatically generate code as you go. Codegen easily integrates into your development workflow.',
                        image: {
                            src: '/assets/eye.svg',
                            alt: 'Illustration'
                        }
                    },
                    {
                        title: 'And Much More...',
                        description:
                            'You can generate your resolvers\' signatures, dump schemas, model types, query builders, React Hooks, Angular Services, and much more!',
                        image: {
                            src: '/assets/more-options.svg',
                            alt: 'more'
                        }
                    }
                ]}
            />
        </>
    );
}
