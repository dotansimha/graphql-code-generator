---
id: typescript-vue-apollo
title: TypeScript Vue Apollo
---

{@import ../plugins/client-note.md}

{@import ../generated-config/typescript-vue-apollo.md}


## Installation

```bash
  yarn add @graphql-codegen/typescript-vue-apollo @vue/apollo-composable @vue/composition-api
```

## Examples

The examples below use Vue 2 with the ([composition api plugin](https://github.com/vuejs/composition-api)).

### Queries

Using the generated query code.

#### Basic query

For the given input:

```graphql
query Message {
  feed {
    id
  }
}
```

We can use the generated code like this:

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>{{ result.feed.id }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api"
import { useMessageQuery } from "../generated/graphqlOperations"

export default defineComponent({
  setup() {
    const { result, loading } = useMessageQuery()
    return { result, loading }
  }
})
</script>
```

#### Select a single property with useResult and add an error message

For the given input:

```graphql
query allAccounts {
  accounts {
    accountID
    givenName
    age
  }
}
```

We can use the generated code with `useResult` like this:

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else-if="allAccounts">
      <div v-for="account in allAccounts" :key="account.accountID">
        {{ account.accountID }}  {{ account.givenName }}  {{ account.age }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api"
import { useResult } from '@vue/apollo-composable'
import { useAllAccountsQuery } from "../generated/graphqlOperations"

export default defineComponent({
  setup() {
    const { result, loading, error } = useAllAccountsQuery()
    // Only select the property 'accounts' for use in the template
    const allAccounts = useResult(result, null, (data) => data.accounts)
    return { allAccounts, loading, error }
  }
})
</script>
```

#### Use an options object

Every `useXxxxQuery` can receive an [options object](https://v4.apollo.vuejs.org/guide-composable/query.html#options) to define query specific settings. To demonstrate the use of an options object we will try to only execute a query once a condition is met.

The ref `isAuthenticated` represents a boolean value that is set to `true` once the user successfully logged in to the app. To retrieve the user's application settings we can only execute the graqhl query once the user is logged on (and the ref `isAuthenticated` is set to `true`). Setting this ref is done in another part of the app and is used as a simple example. 

For the given input:

```graphql
query {
  viewer {
    preference {
      language
      darkMode
    }
  }
}
```
Within the options object is a property `enabled` that defines if a query is enabled or disabled. To only execute the query when `isAuthenticated` is `true` we set the property `enabled` equal to the ref `isAuthenticated`:

```vue
import { defineComponent, watchEffect } from '@vue/composition-api'
import { useViewerQuery } from '../generated/graphqlOperations'
import { isAuthenticated } from 'src/store/authentication'

export default defineComponent({
  setup(_, { root }) {
    // our imported ref:
    // const isAuthenticated = ref(false)
    const { result, loading, error } = useViewerQuery(() => ({
      enabled: isAuthenticated.value,
    }))

    return {
      loading,
      error,
      result,
    }
  },
})
</script>
```

