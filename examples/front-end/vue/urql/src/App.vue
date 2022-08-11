<script setup lang="ts">
import { useQuery } from '@urql/vue';
import { gql } from './gql/gql';
import FilmItem from './components/FilmItem.vue';
import { computed } from 'vue';

const { data } = useQuery({
  query: gql(/* GraphQL */ `
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
