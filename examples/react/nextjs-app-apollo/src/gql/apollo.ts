'use client';

import { ApolloLink, HttpLink } from '@apollo/client';
import {
  NextSSRApolloClient,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr';


/**
 * Make a Apollo client compatible with Client components
 * This requires you to wrap up the parent(s) with ApolloNextAppProvider
 * @see {@link https://www.apollographql.com/blog/apollo-client/next-js/how-to-use-apollo-client-with-next-js-13/}
 */
export function makeClient() {
  const httpLink = new HttpLink({
    uri: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  });

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link:
      typeof window === 'undefined'
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
  });
}
