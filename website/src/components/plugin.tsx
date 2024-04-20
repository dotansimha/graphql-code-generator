import { ReactElement } from 'react';
import { Tabs, Callout, mdxComponents, RemoteContent } from '@theguild/components';

export function PluginHeader(): ReactElement {
  // Get the data from SSG, and render it as a component.
  // const { compiledHeader } = useData();

  return <RemoteContent components={{ ...mdxComponents, Tab: Tabs.Tab, $Tabs: Tabs, Callout }} />;
  // return (
  // <MDXRemote compiledSource={compiledHeader}  />
  // );
}

export const PluginApiDocs = (): ReactElement => {
  // Get the data from SSG, and render it as a component.
  // const { compiledSource } = useData();
  return null;
  // return <MDXRemote compiledSource={compiledSource} />;
};
