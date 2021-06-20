---
id: typescript-vue-apollo-smart-ops
title: TypeScript Vue Apollo Smart Operations
---

{@import ../plugins/client-note.md}

## Installation

```bash
  yarn add @graphql-codegen/typescript-vue-apollo-smart-ops vue-apollo-smart-ops
```

{@import ../generated-config/typescript-vue-apollo-smart-ops.md}

## Examples

### Queries

Using the generated query code.

#### Basic query

For the given input:

```graphql
query Messages($type: FeedType!) {
  feed(type: $type) {
    id
  }
}
```

We can use the generated code like this:

```vue
<template>
  <div>
    <div v-if="loading > 0">Loading...</div>
    <ul v-else>
      <li v-for="message in messages">{{ message.id }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { useMessagesQuery } from "../generated/graphqlOperations"

export default {
  apollo: {
    messages: useMessagesQuery({
      // variables will be correctly typed here!
      variables: {
        type: 'HOT',
      },
      loadingKey: 'loading',
      update: data => data.feed,
    })
  },
  data() {
    return {
      messages: null,
      loading: 0,
    }
  }
}
</script>
```

#### Basic mutation

For the given operation:

```graphql
mutation CreateMessage($text: String!) {
  createMessage(text: $text) {
    id
  }
}
```

We can use the generated code like this:

```vue
<template>
  <div>
    <textarea v-model="text"></textarea>
    <button @click="send">Send Message</button>
  </div>
</template>

<script lang="ts">
import { createMessageMutation } from "../generated/graphqlOperations"

export default {
  data() {
    return {
      text: '',
    }
  },
  async send() {
    const result = await createMessageMutation(this, {
      variables: {
        text: this.text,
      }
    });
    
    if (!result.success || !result.data) {
      alert('Failed to create message');
      return;
    }
    
    const messageId = result.data.createMessage.id;
  }
}
</script>
```
