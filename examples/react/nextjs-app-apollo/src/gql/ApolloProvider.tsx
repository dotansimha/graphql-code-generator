'use client';

import { makeClient } from '@/gql/apollo';
import { ApolloProviderProps } from '@apollo/client/react/context';
import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr';

type Props = Omit<ApolloProviderProps<any>, 'client'>

export function ApolloProvider({ children, ...props }: Props) {
  return (
    <ApolloNextAppProvider makeClient={makeClient} {...props}>
      {children}
    </ApolloNextAppProvider>
  );
}
