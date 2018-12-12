import gql from 'graphql-tag';

interface ModuleWithProviders {
  ngModule: string;
}

export class FooModule {
  static forRoot() {
    return <ModuleWithProviders>{
      ngModule: 'foo'
    };
  }
}

export const query = gql`
  query myQuery {
    fieldA
  }
`;
