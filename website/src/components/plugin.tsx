import { ReactElement } from 'react';
import { useData, Tabs, Callout } from '@theguild/components';
import { MDXRemote } from 'next-mdx-remote';

export function PluginHeader(): ReactElement {
  // Get the data from SSG, and render it as a component.
  const { compiledHeader } = useData();
  return <MDXRemote compiledSource={compiledHeader} components={{ $Tabs: Tabs, Callout }} />;
}

export const PluginApiDocs = (): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { compiledSource } = useData();
  return <MDXRemote compiledSource={compiledSource} />;
};
