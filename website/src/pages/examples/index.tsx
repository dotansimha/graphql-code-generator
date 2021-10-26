import Head from 'next/head';
import React from 'react';
import {EXAMPLES} from '../../components/live-demo/examples';
import {ExampleList} from '@theguild/components/dist/components/ExampleList';
import {ISchemaTypeProps} from '@theguild/components/dist/types/components';
import {handlePushRoute} from '@guild-docs/client';

const ALL_TAGS = Object.keys(EXAMPLES);
const ALL_EXAMPLES = Object.values(EXAMPLES) as any[];


export default function Examples() {
    const examplesItems: Array<ISchemaTypeProps> = React.useMemo(() => {
        if (ALL_EXAMPLES) {
            return ALL_EXAMPLES.map<ISchemaTypeProps>(item => {
                const linkHref = `/examples/demo`;
                return {
                    title: item.title,
                    description: item.description,
                    tags: item.tags,
                    link: {
                        href: linkHref,
                        title: `${item.title} live demo`,
                        onClick: ev => handlePushRoute(linkHref, ev)
                    },
                    schema: item.schema,
                    documents: item.documents,
                    config: item.config
                };
            });
        }

        return [];
    }, []);

    return (
        <>
            <Head>
                <title>Live Demo</title>
            </Head>

            <ExampleList
                list={{
                    title: 'Search Results',
                    items: examplesItems,
                    placeholder: 'No results for {query}',
                    pagination: 8
                }}
                title="Choose live example"
                tagsFilter={ALL_TAGS as string[]}
                placeholder="Find example..."
                queryList={{
                    title: 'Search Results',
                    items: examplesItems,
                    placeholder: 'No results for {query}',
                    pagination: 8
                }}
                pagination={8}
            />
        </>
    );
}
