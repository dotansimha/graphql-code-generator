/**
 * This file tests handing duplicates when using extractAllFieldsToTypesCompact: true
 * Check the resultring __generated__/Duplicates.ts file  - it should not contain any duplicate names.
 */

import { gql } from '@apollo/client';

export const getTypeDefinitionsFragment = gql`
  fragment ConfigTypeDefinitions on ConfigTypeDefinition {
    __typename
    ... on ConfigActionId {
      identifier
    }
    ... on ConfigString {
      identifier
      supportedHtmlTags
    }
    ... on ConfigEnum {
      identifier
      values
    }
  }
`;

export const GET_FEEDBACK_DATA = gql`
  query GetFeedbackData(
    $organizationId: String!
    $first: Int
    $after: String
    $scoreFilter: [Int]
    $sortBy: ProcessableFeedbackSortBy
    $sortOrder: ProcessableFeedbackSortOrder
  ) {
    organization(id: $organizationId) {
      internalOrgData {
        processableFeedback(
          first: $first
          after: $after
          sortBy: $sortBy
          sortOrder: $sortOrder
          scoreFilter: $scoreFilter
        ) {
          edges {
            node {
              id
              orgMemberThread {
                id
                posts(first: 1, after: "") {
                  edges {
                    node {
                      creator {
                        __typename
                        ... on OrgMember {
                          id
                          fullName
                          avatar {
                            imageUrl {
                              url(size: SMALL)
                            }
                          }
                        }
                        ... on EndUser {
                          id
                          fullName
                          avatar {
                            imageUrl {
                              url(size: SMALL)
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
