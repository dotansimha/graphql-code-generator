import Film from '@/components/Film';
import { getClient } from '@/gql/apolloRsc';
import { graphql } from '@/gql/codegen';
import Link from 'next/link';
import React from 'react'

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

export default async function ServerComponentPage() {

  // Type safe data
  const { data } = await getClient().query({ query: AllFilmsWithVariablesQuery, variables: { first: 10 } });
  return (
    <div className={"px-8"}>
      <main className={"min-h-screen flex flex-col justify-center items-center"}>
        {data && (
          <ul className='flex flex-col gap-4'>{data?.allFilms?.edges?.map((e, i) => e?.node && <Film film={e?.node} key={`film-${i}`} />)}</ul>
        )}
        <Link href={'/'} className="mt-10 rounded-lg border border-zinc-700 p-4 px-6">
          Back to home
        </Link>
      </main>
    </div>
  )
}
