import { ReactElement } from 'react';
import { useSSG } from '@theguild/components';
import { MDXRemote } from 'next-mdx-remote';
import ClientNote from './client-note.mdx';

export function PluginHeader({ hasOperationsNote }: { hasOperationsNote?: boolean }): ReactElement {
  // Get the data from SSG, and render it as a component.
  const { compiledHeader } = useSSG();

  return (
    <>
      <MDXRemote compiledSource={compiledHeader} />
      {hasOperationsNote && <ClientNote />}
    </>
  );
}

export const PluginApiDocs = (): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { compiledSource } = useSSG();
  return <MDXRemote compiledSource={compiledSource} />;
};
