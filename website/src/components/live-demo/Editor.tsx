import { ReactElement } from 'react';
import { useTheme } from 'next-themes';
import MonacoEditor from '@monaco-editor/react';
import { canUseDOM } from '@/utils';

const Editor = ({
  value,
  lang,
  readOnly,
  onEdit,
}: {
  lang: string;
  value: string;
  readOnly?: boolean;
  onEdit: (value?: string) => void;
}): ReactElement | null => {
  const { theme } = useTheme()
  if (!canUseDOM) {
    return null;
  }

  return (
    <MonacoEditor
      height="40vh"
      language={lang}
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      value={value}
      options={{
        readOnly,
        minimap: {
          enabled: false,
        },
      }}
      onChange={onEdit}
    />
  );
};

export default Editor;
