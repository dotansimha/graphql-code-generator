import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import { gql } from 'src/gql/gql';

export interface Post {
  id: string;
  title: string;
  votes: number;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
export interface Response {
  posts: Post[];
}

@Injectable({
  providedIn: 'root',
})
export class Films extends Query {
  document = gql(/* GraphQL */ `
    query allFilmsWithVariablesQuery($first: Int!) {
      allFilms(first: $first) {
        edges {
          node {
            # ...FilmItem
            id
            title
            releaseDate
          }
        }
      }
    }
  `);
}
