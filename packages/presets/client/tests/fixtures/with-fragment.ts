/* eslint-disable @typescript-eslint/ban-ts-comment */

//@ts-ignore
const Query = gql(/* GraphQL */ `
  query Foo {
    foo {
      ...Foo
    }
  }
`);

//@ts-ignore
const LsitQuery = gql(/* GraphQL */ `
  query Foos {
    foos {
      ...Foo
    }
  }
`);

//@ts-ignore
const Fragment = gql(/* GraphQL */ `
  fragment Foo on Foo {
    value
  }
`);
