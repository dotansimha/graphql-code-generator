import { createApp } from 'vue';
import urql, { cacheExchange, fetchExchange } from '@urql/vue';
import App from './App.vue';

const app = createApp(App);

app.use(urql, {
  url: 'https://swapi-graphql.netlify.app/graphql',
  exchanges: [cacheExchange, fetchExchange],
});

app.mount('#app');
