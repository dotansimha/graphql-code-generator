// import { format } from 'date-fns';
// import { GetStaticPaths, GetStaticProps } from 'next';
// import Link from 'next/link';
// import React from 'react';
// import tw, { styled } from 'twin.macro';
//
// import { Box, Center, Code, Container, Grid, SimpleGrid } from '@chakra-ui/react';
// import { PackageInstall, RemoteGHMarkdown } from '@guild-docs/client';
// import { buildMDX, CompiledMDX } from '@guild-docs/server';
// import { getPackagesData, PackageWithStats } from '@guild-docs/server/npm';
//
// import { pluginsArr as packageList } from '../../lib/plugins';
// import {ISchemaPageProps} from '@theguild/components/dist/types/components';
// import {SchemaPage} from '@theguild/components/dist/components/SchemaType';
//
// export const SubTitle = styled.h2(() => [tw`mt-0 mb-4 font-bold text-lg md:text-xl`]);
// export const Title = styled.h2(() => [tw`mt-0 mb-4 font-bold text-xl md:text-2xl`]);
//
// const StyledLink = styled.a(() => [tw`cursor-pointer`]);
// const CodeLink = styled(Code)(() => [tw`hover:font-bold`]);
//
// interface ExamplePageProps {
//   data: ISchemaPageProps;
// }
//
// type ExamplePageParams = {
//   name: string;
// };
//
// export const getStaticProps: GetStaticProps<ExamplePageProps, ISchemaPageProps> = async ctx => {
//   const pluginName = ctx.params?.name;
//
//   const pluginsData =
//     typeof pluginName === 'string'
//       ? await getPackagesData({
//           idSpecific: pluginName,
//           packageList,
//         })
//       : [];
//
//   const data = await Promise.all(
//     pluginsData.map(async plugin => {
//       return {
//         ...plugin,
//         mdx: await buildMDX(plugin.readme || plugin.stats?.collected?.metadata?.readme || ''),
//       };
//     })
//   );
//
//   return {
//     props: {
//       data,
//     },
//     // Revalidate at most once every 1 hour
//     revalidate: 60 * 60,
//   };
// };
//
// export const getStaticPaths: GetStaticPaths<PluginPageParams> = async () => {
//   const plugins = await getPackagesData({
//     packageList,
//   });
//
//   return {
//     fallback: 'blocking',
//     paths: plugins.map(({ identifier }) => {
//       return {
//         params: {
//           name: identifier,
//         },
//       };
//     }),
//   };
// };
//
// function PluginPageContent({ data }: PluginPageProps) {
//   if (!data.length) {
//     return (
//       <Center h="300px" flexDir={'column'}>
//         <SubTitle>404</SubTitle>
//         <div>Plugin not found.</div>
//       </Center>
//     );
//   }
//
//   const pluginData = data[0];
//
//   return (
//     <section>
//       <Container p={'1.5rem'} maxWidth={1200}>
//         <Title>
//           <Link href="/plugins" passHref>
//             <a>Plugin Hub</a>
//           </Link>
//           {' >'} {pluginData.title}
//         </Title>
//         <Grid templateColumns={['1fr', '1fr', '1fr 350px']} gap={4}>
//           <Box>
//             <PackageInstall packages={pluginData.npmPackage} />
//             <RemoteGHMarkdown
//               directory={pluginData.stats?.collected?.metadata?.repository?.directory}
//               repo={pluginData.stats?.collected?.metadata?.links?.repository}
//               content={pluginData.mdx}
//             />
//           </Box>
//           <Box gridRow={['1', '1', 'auto']}>
//             <SubTitle>Plugin Details</SubTitle>
//             <SimpleGrid columns={2}>
//               <div>Package</div>
//               <div>
//                 <StyledLink href={`https://www.npmjs.com/package/${pluginData.npmPackage}`}>
//                   <CodeLink as="span">{pluginData.npmPackage}</CodeLink>
//                 </StyledLink>
//               </div>
//               {pluginData.stats?.collected?.metadata?.license ? (
//                 <>
//                   <div>License</div>
//                   <div>
//                     <Code>{pluginData.stats.collected.metadata.license}</Code>
//                   </div>
//                 </>
//               ) : null}
//               {pluginData.stats?.collected?.metadata?.version ? (
//                 <>
//                   <div>Version</div>
//                   <div>
//                     <Code>{pluginData.stats.collected.metadata.version}</Code>
//                   </div>
//                 </>
//               ) : null}
//               {pluginData.stats?.collected?.metadata?.date ? (
//                 <>
//                   <div>Updated</div>
//                   <div>
//                     <Code>{format(new Date(pluginData.stats.collected.metadata.date), 'MMM do, yyyy')}</Code>
//                   </div>
//                 </>
//               ) : null}
//               {pluginData.stats?.collected?.github?.starsCount ? (
//                 <>
//                   <div>Stars</div>
//                   <div>
//                     <Code>{pluginData.stats.collected.github?.starsCount}</Code>
//                   </div>
//                 </>
//               ) : null}
//             </SimpleGrid>
//           </Box>
//         </Grid>
//       </Container>
//     </section>
//   );
// }
//
// export default function LiveDemoPage(data: ISchemaPageProps) {
//     if (!data.schemaName)
//         return (
//             <Center h="300px" flexDir={'column'}>
//                 <SubTitle>404</SubTitle>
//                 <div>Example not found.</div>
//             </Center>
//         );
//     else
//         return (
//             <section>
//                 <Container p={'1.5rem'} maxWidth={1200}>
//                     <Title>
//                         <Link href="/examples" passHref>
//                             <a>Live Demo</a>
//                         </Link>
//                         {' >'} {data.schemaName}
//                     </Title>
//                     <SchemaPage schemaName={data.schemaName} editorData={data.editorData} tags={data.tags}/>
//                 </Container>
//             </section>
//         );
// }
