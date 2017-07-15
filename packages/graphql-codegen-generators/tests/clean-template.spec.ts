import { cleanTemplateComments } from '../src/clean-template';

describe('cleanTemplateComments', () => {
  it('should clean comments from simple one line string with one magic comment', () => {
    const str = `/*gqlgen {{#each test }} */`;
    const result = cleanTemplateComments(str);
    expect(result).toBe('{{#each test }}');
  });

  it('should clean comments and add comments for a complex file with {{ ', () => {
    const str = `
import * as React from 'react';
import { Route } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
import { Home } from '../../home/components/home';
import { DataTable } from '../../data-table/components/data-table';

export const routerHistory = createBrowserHistory();

export const routesDefintion = (
  <div style={{ top: 1 }}>
    <Route exact={true} path="/" component={Home} />
    <Route path="/datatable/">
      /*gqlgen {{#each operations }} */
      /*gqlgen <Route path="/{{ toLowerCase name }}" component={DataTable} /> */
      /*gqlgen {{/each }} */
    </Route>
  </div>
);
`;
    const result = cleanTemplateComments(str);
    expect(result).toBe(`
import * as React from 'react';
import { Route } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
import { Home } from '../../home/components/home';
import { DataTable } from '../../data-table/components/data-table';

export const routerHistory = createBrowserHistory();

export const routesDefintion = (
  <div style=\\\{{ top: 1 }}>
    <Route exact={true} path="/" component={Home} />
    <Route path="/datatable/">
      {{#each operations }}
      <Route path="/{{ toLowerCase name }}" component={DataTable} />
      {{/each }}
    </Route>
  </div>
);
`);
  });

  it('should clean comments from simple multiple line string with multiple uses of magic comments', () => {
    const str = `
    class MyComp extends React.Component {
      render() {
        return (
          <ul>
            /*gqlgen {{#each items }} */
              <li>/*gqlgen{{ test }}*/</li>
            /*gqlgen {{/each}} */
          </ul>
        );
      }
    }`;
    const result = cleanTemplateComments(str);
    expect(result).toBe(`
    class MyComp extends React.Component {
      render() {
        return (
          <ul>
            {{#each items }}
              <li>{{ test }}</li>
            {{/each}}
          </ul>
        );
      }
    }`);
  });
});
