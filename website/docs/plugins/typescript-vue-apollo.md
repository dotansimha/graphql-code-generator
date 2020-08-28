---
id: typescript-vue-apollo
title: TypeScript Vue Apollo
---

{@import ../plugins/client-note.md}

{@import ../generated-config/typescript-vue-apollo.md}


## Installation

```bash
  yarn add @graphql-codegen/typescript-vue-apollo @vue/apollo-composable@4.0.0-alpha.8 @vue/composition-api
```

## Usage examples

The examples below use Vue 2 with the ([composition api plugin](https://github.com/vuejs/composition-api)).

### Example: Using the generated query code

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
import { createComponent } from "@vue/composition-api"
import { useMessageQuery } from "../generated/graphqlOperations"

export default createComponent({
  setup() {
    const { result, loading } = useMessageQuery()
    return { result, loading }
  }
})
</script>
```

### Example: Select a single property with useResult and add an error message

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
import { createComponent } from "@vue/composition-api"
import { useAllAccountsQuery } from "../generated/graphqlOperations"

export default createComponent({
  setup() {
    const { result, loading, error } = useAllAccountsQuery()
    // Only select the peroperty 'accounts' for use in the template
    const allAccounts = useResult(result, null, (data) => data.accounts)
    return { allAccounts, loading, error }
  }
})
</script>
```

