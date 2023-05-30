/* eslint-disable react-hooks/rules-of-hooks */
/* eslint sort-keys: error */
import { useRouter } from 'next/router';
import { defineConfig, Giscus, useTheme } from '@theguild/components';
import { MendableSearchBar } from '@mendable/search';

export default defineConfig({
  docsRepositoryBase: 'https://github.com/dotansimha/graphql-code-generator/tree/master/website',
  search: {
    component: () => {
      return (
        <div className="hidden w-[250px] sm:block">
          <MendableSearchBar
            style={{ darkMode: false, accentColor: 'rgb(0, 76, 163)' }}
            placeholder="How to set up codegen?"
            dialogPlaceholder="What are you looking for?"
            anon_key={process.env.NEXT_PUBLIC_MENDABLE_ANON_KEY!}
            botIcon={<span>🤖</span>}
            userIcon={<span>🧑‍💻</span>}
            messageSettings={{
              openSourcesInNewTab: false,
              prettySources: true,
            }}
            welcomeMessage="Hi, I'm your AI assistant. How can I help you?"
          />
        </div>
      );
    },
  },

  main({ children }) {
    const { resolvedTheme } = useTheme();
    const { route } = useRouter();

    const comments = route !== '/' && (
      <Giscus
        // ensure giscus is reloaded when client side route is changed
        key={route}
        repo="dotansimha/graphql-code-generator"
        repoId="MDEwOlJlcG9zaXRvcnk3NTY1Nzc5MA=="
        category="Docs Discussions"
        categoryId="DIC_kwDOBIJyPs4CSDSK"
        mapping="pathname"
        theme={resolvedTheme}
      />
    );
    return (
      <>
        {children}
        {comments}
      </>
    );
  },
  siteName: 'CODEGEN',
});
