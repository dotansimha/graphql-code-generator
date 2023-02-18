import { graphql, FragmentType, useFragment } from './gql';

export const FilmFragment = graphql(/* GraphQL */ `
  fragment FilmItem on Film {
    id
    title
    releaseDate
    producers
  }
`);

const Film = (props: { film: FragmentType<typeof FilmFragment> }) => {
  const film = useFragment(FilmFragment, props.film);
  return (
    <div>
      <h3>{film.title}</h3>
      <p>{film.releaseDate}</p>
    </div>
  );
};

export default Film;
