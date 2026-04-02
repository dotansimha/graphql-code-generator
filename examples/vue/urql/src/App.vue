<script setup lang="ts">
import { useQuery } from '@urql/vue';
import './assets/main.css';
import { computed } from 'vue';
import FilmItem from './components/FilmItem.vue';
import { graphql } from './gql';

const { data } = useQuery({
  query: graphql(/* GraphQL */ `
    query allFilmsWithVariablesQuery($first: Int!) {
      allFilms(first: $first) {
        edges {
          node {
            ...FilmItem
          }
        }
      }
    }
  `),
  variables: { first: 10 },
});
const films = computed(() => data.value?.allFilms?.edges?.map(e => e?.node!));
</script>

<template>
  <ul>
    <li v-for="film of films"><FilmItem :film="film" /></li>
  </ul>
</template>
