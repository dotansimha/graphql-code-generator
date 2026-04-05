<script setup lang="ts">
import { useClient, useQuery } from 'villus';
import { computed } from 'vue';
import FilmItem from './components/FilmItem.vue';
import { graphql } from './gql';

useClient({
  url: 'https://graphql.org/graphql/',
});

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
