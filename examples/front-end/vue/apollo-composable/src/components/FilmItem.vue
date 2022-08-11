<script setup lang="ts">
import { gql } from '../gql/gql';
import { type FragmentType, useFragment } from '../gql/fragment-masking';

const FilmFragment = gql(/* GraphQL */ `
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
