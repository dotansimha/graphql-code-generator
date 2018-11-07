import { DepGraph } from 'dependency-graph';
import gqlTag from 'graphql-tag';
import { Operation } from 'graphql-codegen-core';
import { Fragment } from 'graphql-codegen-core';

export const operationOptionsType = convert => ({ name, operationType }: any, options: Handlebars.HelperOptions) => {
  const { noNamespaces } = options.data.root.config || { noNamespaces: false };
  if (operationType === 'mutation') {
    return `
            ReactApollo.OperationOption<
                TProps, 
                ${noNamespaces ? convert(name) : ''}Mutation, 
                ${noNamespaces ? convert(name) : ''}Variables, 
                Partial<
                    ReactApollo.MutateProps<
                                            ${noNamespaces ? convert(name) : ''}Mutation, 
                                            ${noNamespaces ? convert(name) : ''}Variables
                                            >
                    > & TChildProps
                > | undefined
        `;
  } else {
    return `
            ReactApollo.OperationOption<
                TProps, 
                ${noNamespaces ? convert(name) : ''}${convert(operationType)}, 
                ${noNamespaces ? convert(name) : ''}Variables, 
                Partial<
                    ReactApollo.DataProps<
                                            ${noNamespaces ? convert(name) : ''}${convert(operationType)}, 
                                            ${noNamespaces ? convert(name) : ''}Variables
                                        >
                        > & TChildProps
                > | undefined
        `;
  }
};

export const generateFragments = convert => (fragments: Fragment[], options: Handlebars.HelperOptions): string => {
  const cachedFragments: Record<string, any> = {};
  if (!fragments) {
    return '';
  }
  const graph = new DepGraph<Fragment>({ circular: true });
  fragments.forEach(fragment => {
    graph.addNode(fragment.name, fragment);
  });
  fragments.forEach(fragment => {
    const depends = extractFragments(fragment.document);
    if (depends) {
      depends.forEach(name => {
        graph.addDependency(fragment.name, name);
      });
    }
  });
  return graph
    .overallOrder()
    .map(name => generateFragment(graph.getNodeData(name), options))
    .join('\n');

  function generateFragment(fragment: any, options: any): string | void {
    const cached = cachedFragments[fragment.name];
    if (!cached) {
      cachedFragments[fragment.name] = fragment;
      const config = options.data.root.config || {};
      const pascalCasedFragmentName = convert(fragment.name);
      // fooBar, FooBar and foo_bar may cause conflict due to the pascalCase.
      // Because all of them will have same namespace FooBar
      if (config.noNamespaces) {
        return `
          export const ${pascalCasedFragmentName}FragmentDoc = ${gql(convert)(fragment, options)};
        `;
      } else {
        return `
          export namespace ${pascalCasedFragmentName} {
            export const FragmentDoc = ${gql(convert)(fragment, options)};
          }
        `;
      }
    } else {
      if (fragment.document !== cached.document) {
        throw new Error(`Duplicated fragment called '${fragment.name}'`);
      }
    }
  }
};

export const gql = convert => (operation: Operation, options: Handlebars.HelperOptions): string => {
  const config = options.data.root.config || {};

  const doc = `
    ${operation.document}
    ${includeFragments(transformFragments(convert)(operation.document, options))}
  `;

  return config.noGraphqlTag ? JSON.stringify(gqlTag(doc)) : 'gql`' + doc + '`';
};

function includeFragments(fragments: string[]): string {
  if (fragments) {
    return `
      ${fragments
        .filter((name, i, all) => all.indexOf(name) === i)
        .map(name => '${' + name + '}')
        .join('\n')}
    `;
  }

  return '';
}

export function extractFragments(document: string): string[] | undefined {
  return (document.match(/\.\.\.[a-z0-9\_]+/gi) || []).map(name => name.replace('...', ''));
}

const transformFragments = convert => (document: string, options: Handlebars.HelperOptions): string[] | undefined => {
  return extractFragments(document).map(document => toFragmentName(convert)(document, options));
};

export const toFragmentName = convert => (fragmentName: string, options: Handlebars.HelperOptions): string => {
  const config = options.data.root.config || {};

  if (config.noNamespaces) {
    return convert(`${fragmentName}FragmentDoc`);
  } else {
    return convert(fragmentName) + '.FragmentDoc';
  }
};
