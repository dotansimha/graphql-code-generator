import { ReactElement } from 'react';
import { useSSG } from 'nextra/ssg';
import { PackageCmd, getComponents, Anchor } from '@theguild/components';
import { MDXRemote } from 'next-mdx-remote';
import { format } from 'date-fns';
import ClientNote from './client-note.mdx';

export const PluginHeader = ({
  isDev = true,
  hasOperationsNote = false,
}: {
  isDev?: boolean;
  hasOperationsNote?: boolean;
}): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { npmPackage, updatedAt } = useSSG();

  return (
    <>
      <h2>Plugin Details</h2>
      {/* Unfortunately Nextra doesn't support import `.mdx` files in `.mdx`, so I copied generated code
       * and exported as React component
       */}
      <div className="table-container">
        <table>
          <tbody>
            <tr>
              <td>Package name</td>
              <td>
                <Anchor href={`https://npmjs.com/package/${npmPackage}`}>
                  <code>{npmPackage}</code>
                </Anchor>
              </td>
            </tr>
            <tr>
              <td>Weekly Downloads</td>
              <td>
                <img alt="downloads" src={`https://badgen.net/npm/dw/${npmPackage}`} className="h-6" />
              </td>
            </tr>
            <tr>
              <td>Version</td>
              <td>
                <img alt="license" src={`https://badgen.net/npm/v/${npmPackage}`} className="h-6" />
              </td>
            </tr>
            <tr>
              <td>License</td>
              <td>
                <img alt="license" src={`https://badgen.net/npm/license/${npmPackage}`} className="h-6" />
              </td>
            </tr>
            <tr>
              <td>Updated</td>
              <td>{format(new Date(updatedAt), 'MMM do, yyyy')}</td>
            </tr>
          </tbody>
        </table>
        <h3>Installation</h3>
        <PackageCmd packages={[`${isDev ? '-D ' : ''}${npmPackage}`]} />
        {hasOperationsNote && <ClientNote />}
      </div>
    </>
  );
};

export const PluginApiDocs = (): ReactElement => {
  // Get the data from SSG, and render it as a component.
  const { compiledSource } = useSSG();
  return <MDXRemote compiledSource={compiledSource} components={getComponents()} />;
};
