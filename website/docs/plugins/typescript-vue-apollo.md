---
id: typescript-vue-apollo
title: TypeScript Vue Apollo
---

{@import ../plugins/client-note.md}

{@import ../generated-config/typescript-vue-apollo.md}


## Installation

```bash
$ yarn add @graphql-codegen/typescript-vue-apollo @vue/apollo-composable@4.0.0-alpha.8 @vue/composition-api
```

## Usage Example

For the given input:

```graphql
query Test {
  feed {
    id
  }
}
```

We can use the generated code like this in Vue 2 ([with composition api plugin](https://github.com/vuejs/composition-api)):

```vue
<template>
  <div>
    {{ result.feed.id }}
  </div>
</template>

<script lang="ts">
import { createComponent } from "@vue/composition-api";
import {
  useTestQuery,
} from "../generated/graphqlOperations";

export default createComponent({
  setup() {
    const { result } = useMessagesQuery();

    return { result };
  }
});
</script>
```

