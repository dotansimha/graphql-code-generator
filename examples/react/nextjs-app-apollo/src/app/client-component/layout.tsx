import { ApolloProvider } from "@/gql/ApolloProvider";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return <ApolloProvider>
    <div className={"px-8"}>
      <main className={"min-h-screen flex flex-col justify-center items-center"}>
        {children}
      </main>
    </div>
  </ApolloProvider>
}
