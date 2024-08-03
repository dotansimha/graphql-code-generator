/* eslint-disable @typescript-eslint/ban-ts-comment */

//@ts-ignore
const videoQueryDocument = gql(/* GraphQL */ `
  mutation Video($id: ID!) {
    saveVideo(id: $id) {
      movie @populate
    }
  }
`);
