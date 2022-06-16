# Schema reports

Technical details about the schema reports.

| Name     | Value                                                   |
| -------- | ------------------------------------------------------- |
| Endpoint | `https://app.graphql-hive.com/registry`                 |
| Header   | `X-API-Token: token-here`                               |
| Method   | `POST`                                                  |
| Body     | GraphQL Request - `{ query, operationName, variables }` |

```graphql
input SchemaPublishInput {
  """
  Name of the service (applicable only for Federation and Stitching)
  """
  service: ID
  """
  An url of the service (applicable only for Federation and Stitching)
  """
  url: String
  """
  Schema definitions
  """
  sdl: String!
  """
  Author of the changes
  """
  author: String!
  """
  Unique identifier of the changes
  """
  commit: String!
  """
  GraphQL Hive prevents from publishing breaking changes or broken schemas by default, use this flag to override this behavior.
  """
  force: Boolean
}

mutation schemaPublish($input: SchemaPublishInput!) {
  schemaPublish(input: $input) {
    __typename
    ... on SchemaPublishSuccess {
      initial
      valid
      changes {
        nodes {
          message
          criticality
        }
        total
      }
    }
    ... on SchemaPublishError {
      valid
      changes {
        nodes {
          message
          criticality
        }
        total
      }
      errors {
        nodes {
          message
        }
        total
      }
    }
    ... on SchemaPublishMissingServiceError {
      message
    }
  }
}
```
