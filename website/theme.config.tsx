/* eslint-disable react-hooks/rules-of-hooks */
/* eslint sort-keys: error */
import { useRouter } from 'next/router';
import { defineConfig, Giscus, ChatBotSearch, useTheme } from '@theguild/components';

export default defineConfig({
  docsRepositoryBase: 'https://github.com/dotansimha/graphql-code-generator/tree/master/website',
  search: {
    component: props => (
      <ChatBotSearch
        apiURL="/api/gpt-bot"
        placeholder="How do I use plugins?"
        title="Ask The Guild's AI Bot"
        accentColor="var(--colors-accent)"
        sampleQuestion={['How do I use custom scalars?', 'How do I set up codegen?', 'What is a plugin?']}
        {...props}
      />
    ),
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
