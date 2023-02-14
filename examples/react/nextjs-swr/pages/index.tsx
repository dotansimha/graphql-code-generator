import type { NextPage } from 'next';

import { graphql } from '../gql';

import styles from '../styles/Home.module.css';
import Film from '../components/Film';
import { useGraphQL } from '../hooks/use-query';

const AllFilmsWithVariablesQuery = graphql(/* GraphQL */ `
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
  const { data } = useGraphQL(AllFilmsWithVariablesQuery, { first: 10 });
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {data && (
          <ul>{data.data?.allFilms?.edges?.map((e, i) => e?.node && <Film film={e?.node} key={`film-${i}`} />)}</ul>
        )}
      </main>
    </div>
  );
};

export default Home;
