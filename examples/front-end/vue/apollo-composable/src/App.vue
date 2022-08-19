<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable';
import { gql } from './gql/gql';
import FilmItem from './components/FilmItem.vue';
import { computed } from 'vue';

const { result } = useQuery(
  gql(/* GraphQL */ `
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
  { first: 10 }
);
const films = computed(() => result.value?.allFilms?.edges?.map(e => e?.node!));
</script>

<template>
  <ul>
    <li v-for="film of films"><FilmItem :film="film" /></li>
  </ul>
</template>
