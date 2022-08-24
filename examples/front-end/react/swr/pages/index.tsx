import type { NextPage } from 'next';
import useSWR from 'swr';
import request from 'graphql-request';

import { graphql } from '../gql/gql';

import styles from '../styles/Home.module.css';
import Film from '../components/Film';

const allFilmsWithVariablesQueryDocument = graphql(/* GraphQL */ `
  query allFilmsWithVariablesQuery($first: Int!) {
    allFilms(first: $first) {
      edges {
        node {
          ...FilmItem
        }
      }
    }
  }
`);

const Home: NextPage = () => {
  const { data } = useSWR(['films', { first: 10 }], async (_key, variables) =>
    request('https://swapi-graphql.netlify.app/.netlify/functions/index', allFilmsWithVariablesQueryDocument, variables)
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {data && <ul>{data.allFilms?.edges?.map((e, i) => e?.node && <Film film={e?.node} key={`film-${i}`} />)}</ul>}
      </main>
    </div>
  );
};

export default Home;
