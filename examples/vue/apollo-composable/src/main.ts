import { createApp, h, provide } from 'vue';
import './assets/main.css';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import { DefaultApolloClient } from '@vue/apollo-composable';
import App from './App.vue';

const httpLink = new HttpLink({
  uri: 'https://graphql.org/graphql/',
});

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },

  render: () => h(App),
}).mount('#app');
