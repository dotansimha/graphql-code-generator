import { ReactElement } from 'react';
import { useSSG } from 'nextra/ssg';
import { PackageCmd } from '@theguild/components';
import { MDXRemote } from 'next-mdx-remote';
import ClientNote from './client-note.mdx';

export const PluginHeader = ({
  isDev = true,
  hasOperationsNote = false,
}: {
  isDev?: boolean;
  hasOperationsNote?: boolean;
}): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { npmPackage, compiledHeader } = useSSG();

  return (
    <>
      <MDXRemote compiledSource={compiledHeader} />
      <PackageCmd packages={[`${isDev ? '-D ' : ''}${npmPackage}`]} />
      {hasOperationsNote && <ClientNote />}
    </>
  );
};

export const PluginApiDocs = (): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { compiledSource } = useSSG();
  return <MDXRemote compiledSource={compiledSource} />;
};
