import gql from 'graphql-tag';

namespace Foo {
  export const foo = 12;

  export const query = gql`
    query myQueryInNamespace {
      fieldA
    }
  `;
}

interface ModuleWithProviders {
  ngModule: string;
}

export class FooModule {
  static forRoot() {
    return {
      ngModule: 'foo',
      value: Foo.foo,
    } as ModuleWithProviders;
  }
}

export const query = gql`
  query myQuery {
    fieldA
  }
`;
