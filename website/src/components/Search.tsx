import { MendableSearchBar } from '@mendable/search';
import { useTheme, useMounted } from '@theguild/components';

export function Search() {
  const { resolvedTheme } = useTheme();
  const isMounted = useMounted();
  return (
    <div className="w-[250px] max-sm:hidden">
      <MendableSearchBar
        style={{
          darkMode: isMounted && resolvedTheme === 'dark',
          accentColor: 'rgb(0, 76, 163)',
        }}
        placeholder="Ask a question"
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
}
