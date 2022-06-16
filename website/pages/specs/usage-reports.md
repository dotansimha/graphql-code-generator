# Usage reports

The official JavaScript Hive Client (`@graphql-hive/client`) collects executed operations and sends them in batches (as a single report, when a buffer is full or every few seconds) over HTTP.

> It's recommended to send a report for more than 1 operation.
> The maximum payload size is 1 MB.

| Name     | Value                                |
| -------- | ------------------------------------ |
| Endpoint | `https://app.graphql-hive.com/usage` |
| Header   | `X-API-Token: token-here`            |
| Method   | `POST`                               |

**Data structure**

<details>
  <summary>TypeScript schema</summary>

```typescript
export interface Report {
  /**
   * Number of collected operations
   */
  size: number
  map: OperationMap
  operations: Operation[]
}

export interface OperationMap {
  [key: string]: OperationMapRecord
}

export interface OperationMapRecord {
  /**
   * Operation's body
   * e.g. query me { me { id name } }
   */
  operation: string
  /**
   * Name of the operation ('me')
   */
  operationName?: string
  /**
   * Schema coordinates (['Query', 'Query.me', 'User', 'User.id', 'User.name'])
   */
  fields: string[]
}

export interface Operation {
  /**
   * The key of the operation in the operation map
   */
  operationMapKey: string
  /**
   * A number representing the milliseconds elapsed since the UNIX epoch.
   */
  timestamp: number
  execution: Execution
  metadata?: Metadata
}

export interface Execution {
  /**
   * true - successful operation
   * false - failed operation
   */
  ok: boolean
  /**
   * Duration of the entire operation in nanoseconds
   */
  duration: number
  /**
   * Total number of GraphQL errors
   */
  errorsTotal: number
}

export interface Metadata {
  client?: Client
}

export interface Client {
  name?: string
  version?: string
}
```

</details>

<details>
  <summary>JSON Schema</summary>

```json
{
  "$ref": "#/definitions/Report",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "Client": {
      "additionalProperties": false,
      "properties": {
        "name": {
          "type": "string"
        },
        "version": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "Execution": {
      "additionalProperties": false,
      "properties": {
        "duration": {
          "description": "Duration of the entire operation in nanoseconds",
          "type": "number"
        },
        "errorsTotal": {
          "description": "Total number of GraphQL errors",
          "type": "number"
        },
        "ok": {
          "description": "true - successful operation false - failed operation",
          "type": "boolean"
        }
      },
      "required": ["ok", "duration", "errorsTotal"],
      "type": "object"
    },
    "Metadata": {
      "additionalProperties": false,
      "properties": {
        "client": {
          "$ref": "#/definitions/Client"
        }
      },
      "type": "object"
    },
    "Operation": {
      "additionalProperties": false,
      "properties": {
        "execution": {
          "$ref": "#/definitions/Execution"
        },
        "metadata": {
          "$ref": "#/definitions/Metadata"
        },
        "operationMapKey": {
          "description": "The key of the operation in the operation map",
          "type": "string"
        },
        "timestamp": {
          "description": "A number representing the milliseconds elapsed since the UNIX epoch.",
          "type": "number"
        }
      },
      "required": ["operationMapKey", "timestamp", "execution"],
      "type": "object"
    },
    "OperationMap": {
      "additionalProperties": {
        "$ref": "#/definitions/OperationMapRecord"
      },
      "type": "object"
    },
    "OperationMapRecord": {
      "additionalProperties": false,
      "properties": {
        "fields": {
          "description": "Schema coordinates (['Query', 'Query.me', 'User', 'User.id', 'User.name'])",
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "operation": {
          "description": "Operation's body e.g. query me { me { id name } }",
          "type": "string"
        },
        "operationName": {
          "description": "Name of the operation ('me')",
          "type": "string"
        }
      },
      "required": ["operation", "fields"],
      "type": "object"
    },
    "Report": {
      "additionalProperties": false,
      "properties": {
        "map": {
          "$ref": "#/definitions/OperationMap"
        },
        "operations": {
          "items": {
            "$ref": "#/definitions/Operation"
          },
          "type": "array"
        },
        "size": {
          "description": "Number of collected operations",
          "type": "number"
        }
      },
      "required": ["size", "map", "operations"],
      "type": "object"
    }
  }
}
```

</details>

**Example**

```json
{
  "size": 3,
  "map": {
    "c3b6d9b0": {
      "operationName": "me",
      "operation": "query me { me { id name } }",
      "fields": ["Query", "Query.me", "User", "User.id", "User.name"]
    },
    "762a45e3": {
      "operationName": "users",
      "operation": "query users { users { id } }",
      "fields": ["Query", "Query.users", "User", "User.id"]
    }
  },
  "operations": [
    {
      "operationMapKey": "c3b6d9b0", // points to the 'me' query
      "timestamp": 1655112281535,
      "execution": {
        "ok": true,
        "duration": 150000000, // 150ms in nanoseconds
        "errorsTotal": 0
      }
    },
    {
      "operationMapKey": "c3b6d9b0", // points to the 'me' query
      "timestamp": 1655112327589,
      "execution": {
        "ok": false, // failed operation
        "duration": 150000000, // 150ms in nanoseconds
        "errorsTotal": 1 // 1 GraphQL error
      }
    },
    {
      "operationMapKey": "762a45e3", // points to the 'users' query
      "timestamp": 1655112327589,
      "execution": {
        "ok": true,
        "duration": 150000000, // 150ms in nanoseconds
        "errorsTotal": 0
      }
    }
  ]
}
```
