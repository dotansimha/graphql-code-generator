/* eslint-disable @typescript-eslint/ban-ts-comment */

//@ts-ignore
export const WidgetFragment = gql(/* GraphQL */ `
  fragment WidgetFragment on Widget {
    title {
      ...MarkdownFragment
    }
  }
`);

//@ts-ignore
export const PingQuery = gql(/* GraphQL */ `
  query Ping {
    ping {
      ...WidgetFragment
    }
  }
`);
