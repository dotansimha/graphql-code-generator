/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import gql from 'gql-tag';

const Subscription = gql(`
  subscription onRegionCreated {
    onRegionCreated{
      regionId
      regionDescription
    }
  }
`);
