import Head from 'next/head';
import React from 'react';
import {EXAMPLES_CODEGEN} from '../../components/live-demo/examples';
import {MarketplaceSearch} from '@theguild/components';
import {handlePushRoute} from '@guild-docs/client';
import {ISchemaTypeProps} from '@theguild/components/dist/types/components';
import {GetStaticProps} from 'next';

const ALL_TAGS = Object.keys(EXAMPLES_CODEGEN);

export interface ExampleItem {
    title: string;
    description: string;
    tags: string[];
    config: string;
    schema: string;
    documents: string;
}

interface ExampleProps {
    data: ExampleItem[];
}

export const getStaticProps: GetStaticProps<ExampleProps> = async () => {
    let allExamples: any[] = [];
    Object.values(EXAMPLES_CODEGEN).map(a => allExamples.push(...a))
    return {
        props: {
            data: allExamples
        },
        // Revalidate at most once every 1 hour
        revalidate: 60 * 60
    };
};

export default function Examples({data}: ExampleProps) {
    const examplesItems = data.map<ISchemaTypeProps>(item => {
        const linkHref = `/examples/${item.title}`;
        return {
            title: item.title,
            description: item.description,
            tags: item.tags,
            link: {
                href: linkHref,
                title: `${item.title} live demo`,
                onClick: (ev: Pick<React.MouseEvent<Element, MouseEvent>, 'preventDefault'>) => handlePushRoute(linkHref, ev)
            },
            schema: item.schema,
            documents: item.documents,
            config: item.config
        };
    });
    const tsItems: Array<ISchemaTypeProps> = React.useMemo(() => {
        return EXAMPLES_CODEGEN.TypeScript.map<ISchemaTypeProps>((item: any) => {
            const linkHref = `/examples/${item.title}`;
            return {
                title: item.title,
                description: item.description,
                tags: item.tags,
                link: {
                    href: linkHref,
                    title: `${item.title} live demo`,
                    onClick: (ev: any) => handlePushRoute(linkHref, ev)
                },
                schema: item.schema,
                documents: item.documents,
                config: item.config
            };
        });
    }, []);
    const javaItems: Array<ISchemaTypeProps> = React.useMemo(() => {
        return EXAMPLES_CODEGEN.Java.map<ISchemaTypeProps>(item => {
            const linkHref = `/examples/${item.title}`;
            return {
                title: item.title,
                description: '',
                tags: item.tags,
                link: {
                    href: linkHref,
                    title: `${item.title} live demo`,
                    onClick: (ev: any) => handlePushRoute(linkHref, ev)
                },
                schema: item.schema,
                documents: item.documents,
                config: item.config
            };
        });
    }, []);
    const EmptyTableHeader = () => (
        <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
        </tr>
    );
    // @ts-ignore
    return (
        <>
            <Head>
                <title>Live Demo</title>
            </Head>

            <MarketplaceSearch
                title="Choose Live Example"
                tagsFilter={ALL_TAGS as any as string[]}
                placeholder="Search examples..."
                primaryList={{
                    title: 'TYPESCRIPT',
                    items: tsItems,
                    placeholder: '0 items',
                    pagination: 8,
                    tableHeader: <EmptyTableHeader/>
                }}
                secondaryList={{
                    title: 'JAVA',
                    items: javaItems,
                    placeholder: '0 items',
                    pagination: 8,
                    tableHeader: <EmptyTableHeader/>

                }}
                queryList={{
                    title: 'Search Results',
                    items: examplesItems,
                    placeholder: 'No results for {query}',
                    pagination: 8,
                    tableHeader: <EmptyTableHeader/>
                }}
            />
        </>
    );
}
