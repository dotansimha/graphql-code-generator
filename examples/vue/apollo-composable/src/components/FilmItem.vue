<script setup lang="ts">
import { graphql, type FragmentType, useFragment } from '../gql';

const FilmFragment = graphql(/* GraphQL */ `
  fragment FilmItem on Film {
    id
    title
    releaseDate
    producers
  }
`);

const props = defineProps<{
  film: FragmentType<typeof FilmFragment>;
}>();

const filmObj = useFragment(FilmFragment, props.film);
</script>

<template>
  <div>
    <h3>{{ filmObj.title }}</h3>
    <p>{{ filmObj.releaseDate }}</p>
  </div>
</template>
