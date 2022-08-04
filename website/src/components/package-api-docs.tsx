import { ReactElement } from 'react';
import { useSSG } from 'nextra/ssg';
import { components } from 'nextra-theme-docs/theme';
import { Callout, PackageCmd } from '@theguild/components';
import { MDXRemote } from 'next-mdx-remote';
import { format } from 'date-fns';

export const PackageApiDocs = (): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { pluginData } = useSSG();

  return <MDXRemote compiledSource={pluginData.compiledSource} components={components} />;
};

export const PackageHeader = ({
  isDev = true,
  hasOperationsNote = false,
}: {
  isDev?: boolean;
  hasOperationsNote?: boolean;
}): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { pluginData } = useSSG();

  return (
    <>
      <h2>{pluginData.title}</h2>
      <h3>Package Details</h3>
      {/* Unfortunately Nextra doesn't support import `.mdx` files in `.mdx`, so I copied generated code
       * and exported as React component
       */}
      <div className="table-container">
        <table>
          <tbody>
            <tr>
              <td>Package</td>
              <td>
                <a href={`https://npmjs.com/package/${pluginData.npmPackage}`} target="_blank" rel="noreferrer">
                  <code>{pluginData.npmPackage}</code>
                </a>
              </td>
            </tr>
            <tr>
              <td>Weekly Downloads</td>
              <td>
                <img alt="downloads" src={`https://badgen.net/npm/dw/${pluginData.npmPackage}`} />
              </td>
            </tr>
            <tr>
              <td>Version</td>
              <td>
                <img alt="license" src={`https://badgen.net/npm/v/${pluginData.npmPackage}`} />
              </td>
            </tr>
            <tr>
              <td>License</td>
              <td>
                <img alt="license" src={`https://badgen.net/npm/license/${pluginData.npmPackage}`} />
              </td>
            </tr>
            <tr>
              <td>Updated</td>
              <td>{format(new Date(pluginData.stats.modifiedDate), 'MMM do, yyyy')}</td>
            </tr>
          </tbody>
        </table>
        <h3>Installation</h3>
        <PackageCmd packages={[`${isDev ? '-D ' : ''}${pluginData.npmPackage}`]} />
        {hasOperationsNote && (
          <Callout type="warning" emoji="⚠️">
            <p>
              <strong>Usage Requirements</strong>
            </p>
            <p>
              In order to use this GraphQL Codegen plugin, please make sure that you have GraphQL operations (
              <code>query</code> / <code>mutation</code> / <code>subscription</code> and <code>fragment</code>) set as{' '}
              <code>documents: …</code> in your <code>codegen.yml</code>.
            </p>
            <p>
              Without loading your GraphQL operations (<code>query</code>, <code>mutation</code>,{' '}
              <code>subscription</code> and <code>fragment</code>), you won't see any change in the generated output.
            </p>
          </Callout>
        )}
      </div>
    </>
  );
};
