import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { DocsContent, DocsTOC, MDXPage } from '@guild-docs/client';
import { MDXPaths, MDXProps } from '@guild-docs/server';
import { getRoutes } from '../../../routes';

export default MDXPage(({ content, TOC, MetaHead, BottomNavigation }) => (
  <>
    <Head>{MetaHead}</Head>
    <DocsContent>{content}</DocsContent>
    <DocsTOC>
      <TOC />
      <BottomNavigation />
    </DocsTOC>
  </>
));

export const getStaticProps: GetStaticProps = ctx => {
  return MDXProps(
    ({ readMarkdownFile, getArrayParam }) =>
      readMarkdownFile('docs/', getArrayParam('slug'), { importPartialMarkdown: true }),
    ctx,
    { getRoutes }
  );
};

export const getStaticPaths: GetStaticPaths = ctx => {
  return MDXPaths('docs', { ctx });
};
