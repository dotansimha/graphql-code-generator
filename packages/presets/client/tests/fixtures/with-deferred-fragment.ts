/* eslint-disable @typescript-eslint/ban-ts-comment */

//@ts-ignore
const Query = gql(/* GraphQL */ `
  query Foo {
    foo {
      ...Foo @defer
    }
  }
`);

//@ts-ignore
const ListQuery = gql(/* GraphQL */ `
  query Foos {
    foos {
      ...Foo @defer
    }
  }
`);

//@ts-ignore
const Fragment = gql(/* GraphQL */ `
  fragment Foo on Foo {
    value
  }
`);

//@ts-ignore
const NestedFragment = gql(/* GraphQL */ `
  fragment foo on Foo {
    id
    ... on Foo @defer {
      value
    }
  }
`);

//@ts-ignore
const NestedFragmentWithFragment = gql(/* GraphQL */ `
  fragment fooNested on Foo {
    id
    ...foo @defer
  }
`);
