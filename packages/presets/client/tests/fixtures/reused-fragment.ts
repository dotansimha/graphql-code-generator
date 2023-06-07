/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

const SharedComponentFragment = graphql(`
  fragment SharedComponentFragment on User {
    id
    username
  }
`);

const EventHeaderComponentFragment = graphql(`
  fragment EventHeaderComponentFragment on Event {
    owner {
      ...SharedComponentFragment
    }
  }
`);

const EventQueryDocument = graphql(`
  query EventQuery($eventId: ID!) {
    event(id: $eventId) {
      ...EventHeaderComponentFragment
      attendees {
        ...SharedComponentFragment
      }
    }
  }
`);
