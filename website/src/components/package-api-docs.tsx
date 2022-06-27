import { ReactElement } from 'react';
import { useSSG } from 'nextra/ssg';
import { components } from 'nextra-theme-docs/theme';
import { MDXRemote } from 'next-mdx-remote';
import { PackageCmd } from './package-cmd';
import { format } from 'date-fns';

export const PackageApiDocs = (): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { pluginData } = useSSG();

  return <MDXRemote compiledSource={pluginData.compiledSource} components={components} />;
};

export const PackageHeader = ({ isDev = true }: { isDev: boolean }): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { pluginData } = useSSG();

  return (
    <>
      <h2>{pluginData.title}</h2>
      <h3>Package Details</h3>
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
      </div>
    </>
  );
};
