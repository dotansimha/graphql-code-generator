import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';
import { Box, Center, Code, Container, Grid, SimpleGrid } from '@chakra-ui/react';
import { PackageInstall, RemoteGHMarkdown } from '@guild-docs/client';
import { buildMDX, CompiledMDX } from '@guild-docs/server';
import { getPackagesData, PackageWithStats } from '@guild-docs/server/npm';
import { packageList } from '../../lib/plugins';

export const SubTitle = styled.h2(() => [tw`mt-0 mb-4 font-bold text-lg md:text-xl`]);
export const Title = styled.h2(() => [tw`mt-0 mb-4 font-bold text-xl md:text-2xl`]);

const StyledLink = styled.a(() => [tw`cursor-pointer`]);
const CodeLink = styled(Code)(() => [tw`hover:font-bold`]);

interface PluginPageProps {
  data: (PackageWithStats & { mdx: CompiledMDX })[];
}

type PluginPageParams = {
  name: string;
};

export const getStaticProps: GetStaticProps<PluginPageProps, PluginPageParams> = async ctx => {
  const pluginName = ctx.params?.name;

  const pluginsData =
    typeof pluginName === 'string'
      ? await getPackagesData({
          idSpecific: pluginName,
          packageList,
        })
      : [];

  const data = await Promise.all(
    pluginsData.map(async plugin => {
      return {
        ...plugin,
        mdx: await buildMDX(plugin.readme || plugin.stats?.readme || ''),
      };
    })
  );

  return {
    props: {
      data,
    },
    // Revalidate at most once every 1 hour
    revalidate: 60 * 60,
  };
};

export const getStaticPaths: GetStaticPaths<PluginPageParams> = async () => {
  const plugins = await getPackagesData({ packageList });

  return {
    fallback: 'blocking',
    paths: plugins.map(({ identifier }) => {
      return {
        params: {
          name: identifier,
        },
      };
    }),
  };
};

const PluginPageContent: FC<PluginPageProps> = ({ data }) => {
  if (!data.length) {
    return (
      <Center h="300px" flexDir="column">
        <SubTitle>404</SubTitle>
        <div>Plugin not found.</div>
      </Center>
    );
  }

  const pluginData = data[0];

  return (
    <>
      <Container p="1.5rem" maxWidth={1200}>
        <Title>{pluginData.title}</Title>
        <Grid templateColumns={['1fr', '1fr', '1fr 350px']} gap={4}>
          <Box>
            <PackageInstall packages={pluginData.npmPackage} />
            <RemoteGHMarkdown
              directory={pluginData.stats?.repositoryDirectory}
              repo={pluginData.stats?.repositoryLink}
              content={pluginData.mdx}
            />
          </Box>
          <Box gridRow={['1', '1', 'auto']}>
            <SubTitle>Package Details</SubTitle>
            <SimpleGrid columns={2}>
              <div>Package</div>
              <div>
                <StyledLink href={`https://www.npmjs.com/package/${pluginData.npmPackage}`}>
                  <CodeLink as="span">{pluginData.npmPackage}</CodeLink>
                </StyledLink>
              </div>
              {pluginData.stats?.license ? (
                <>
                  <div>License</div>
                  <div>
                    <Code>{pluginData.stats.license}</Code>
                  </div>
                </>
              ) : null}
              {pluginData.stats?.version ? (
                <>
                  <div>Version</div>
                  <div>
                    <Code>{pluginData.stats.version}</Code>
                  </div>
                </>
              ) : null}
              {pluginData.stats?.modifiedDate ? (
                <>
                  <div>Updated</div>
                  <div>
                    <Code>{format(new Date(pluginData.stats.modifiedDate), 'MMM do, yyyy')}</Code>
                  </div>
                </>
              ) : null}
              {pluginData.stats?.weeklyNPMDownloads ? (
                <>
                  <div>Weekly Downloads</div>
                  <div>
                    <Code>{pluginData.stats?.weeklyNPMDownloads}</Code>
                  </div>
                </>
              ) : null}
            </SimpleGrid>
          </Box>
        </Grid>
      </Container>
    </>
  );
};

export default PluginPageContent;
