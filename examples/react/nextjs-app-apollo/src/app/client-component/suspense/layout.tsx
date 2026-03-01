import { PropsWithChildren, Suspense } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return <Suspense fallback={'Loading'}>
    {children}
  </Suspense>
}
