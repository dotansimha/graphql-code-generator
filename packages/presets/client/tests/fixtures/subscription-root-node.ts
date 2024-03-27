/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import gql from 'gql-tag';

gql(`
  subscription onRegionCreated {
    onRegionCreated{
      regionId
      regionDescription
    }
  }
`);
