'use client'

import Film from "@/components/Film";
import { graphql } from "@/gql/codegen"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import Link from "next/link";

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
`)

export default function ClientComponent() {
  const { data } = useQuery(AllFilmsWithVariablesQuery, { variables: { first: 10 }, fetchPolicy: 'no-cache' });
  return (
    <>
      {data && (
        <ul className='flex flex-col gap-4'>{data?.allFilms?.edges?.map((e, i) => e?.node && <Film film={e?.node} key={`film-${i}`} />)}</ul>
      )}
      <Link href={'/'} className="mt-10 rounded-lg border border-zinc-700 p-4 px-6">
        Back to home
      </Link>
    </>
  )
}
