import { FragmentType, useFragment, graphql } from '@/gql/codegen'

export const FilmFragment = graphql(/* GraphQL */ `
  fragment FilmItem on Film {
    id
    title
    releaseDate
    producers
  }
`);

const Film = (props: {
  /* tweet property has the correct type 🎉 */
  film: FragmentType<typeof FilmFragment>;
}) => {

  // useFragment is not a hook, it is a util to extract data from props
  const film = useFragment(FilmFragment, props.film);
  return (
    <div className='bg-zinc-900 p-4 rounded-lg'>
      <h3 className='text-2xl text-medium'>{film.title}</h3>
      <p className='mt-2 text-zinc-400'>{film.releaseDate}</p>
    </div>
  );
};

export default Film;
