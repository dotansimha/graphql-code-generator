import {GetStaticPaths, GetStaticProps} from 'next';
import Link from 'next/link';
import React from 'react';
import tw, {styled} from 'twin.macro';

import {Center, Container} from '@chakra-ui/react';

import {EXAMPLES_CODEGEN} from '../../components/live-demo/examples';
import {ISchemaPageProps} from '@theguild/components/dist/types/components';
import {ExampleItem} from './index';
import {SchemaPage} from '@theguild/components/dist/components/SchemaPage';

export const SubTitle = styled.h2(() => [tw`mt-0 mb-4 font-bold text-lg md:text-xl`]);
export const Title = styled.h2(() => [tw`mt-0 mb-4 font-bold text-xl md:text-2xl`]);

interface ExamplePageProps {
    data: ISchemaPageProps;
}

type ExamplePageParams = {
    name: string;
};

const getExampleSchema: (schemaName: string) => ExampleItem =
    (schemaName: string) => {
        let allExamples: any[] = [];
        Object.values(EXAMPLES_CODEGEN).map(a => allExamples.push(...a));
        return allExamples.find(example => example.title == schemaName);
    };

const getAllSchemaNames = () => {
    let allExamples: any[] = [];
    Object.values(EXAMPLES_CODEGEN).map(a => allExamples.push(...a));
    allExamples = allExamples.map(example => example.title);
    return allExamples;
};

export const getStaticProps: GetStaticProps<ExamplePageProps, ExamplePageParams> = async ctx => {
    const schemaName = ctx.params?.name ?? '';
    const exampleData: ExampleItem = getExampleSchema(schemaName);

    const data: ISchemaPageProps = {
        editorData: [exampleData.schema, exampleData.documents, exampleData.config],
        tags: exampleData.tags,
        schemaName: exampleData.title
    };

    return {
        props: {
            data
        },
        // Revalidate at most once every 1 hour
        revalidate: 60 * 60
    };
};


export const getStaticPaths: GetStaticPaths<ExamplePageParams> = async () => {
    const exampleNames = getAllSchemaNames();

    return {
        fallback: 'blocking',
        paths: exampleNames.map((title) => {
            return {
                params: {
                    name: title
                }
            };
        })
    };
};


export default function LiveDemoPage(props: ExamplePageProps) {
    if (!props.data.schemaName)
        return (
            <Center h="300px" flexDir={'column'}>
                <SubTitle>404</SubTitle>
                <div>Oops... <br/> Example not found.</div>
            </Center>
        );
    else
        return (
            <section>
                <Container p={'1.5rem'} maxWidth={1200}>
                    <Title>
                        <Link href="/examples" passHref>
                            <a>Examples Hub</a>
                        </Link>
                        {' >'} {props.data.schemaName}
                    </Title>
                </Container>
                <SchemaPage schemaName={props.data.schemaName}
                            editorData={props.data.editorData}/>
            </section>
        );
}
