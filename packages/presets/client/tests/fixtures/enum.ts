/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import gql from 'gql-tag';

//@ts-ignore
const A = gql(/* GraphQL */ `
  query FavoriteColor {
    thing {
      color
    }
  }
`);
