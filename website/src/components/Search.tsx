import { MendableSearchBar } from '@mendable/search';
import { useSyncExternalStore } from 'react';

const darkModeStore = {
  subscribe(callback: () => void) {
    const mutationObserver = new MutationObserver(callback);
    mutationObserver.observe(document.documentElement, { attributeFilter: ['class'] });

    return () => mutationObserver.disconnect();
  },
  getSnapshot: () => document.documentElement.classList.contains('dark'),
  getServerSnapshot: () => false,
};

export function Search() {
  const darkMode = useSyncExternalStore(
    darkModeStore.subscribe,
    darkModeStore.getSnapshot,
    darkModeStore.getServerSnapshot
  );

  return (
    <div className="hidden w-[250px] sm:block">
      <MendableSearchBar
        style={{ darkMode, accentColor: 'rgb(0, 76, 163)' }}
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
        cmdShortcutKey="Ctrl+K"
      />
    </div>
  );
}
