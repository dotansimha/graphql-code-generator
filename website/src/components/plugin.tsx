import { ReactElement } from 'react';
import { useSSG, Tab, Tabs, Callout } from '@theguild/components';
import { MDXRemote } from 'next-mdx-remote';

export function PluginHeader(): ReactElement {
  // Get the data from SSG, and render it as a component.
  const { compiledHeader } = useSSG();
  return <MDXRemote compiledSource={compiledHeader} components={{ $Tab: Tab, $Tabs: Tabs, Callout }} />;
}

export const PluginApiDocs = (): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { compiledSource } = useSSG();
  return <MDXRemote compiledSource={compiledSource} />;
};
