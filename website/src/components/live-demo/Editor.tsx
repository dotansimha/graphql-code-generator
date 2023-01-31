import { ReactElement } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useTheme } from '@theguild/components';

export function Editor({
  value,
  lang,
  readOnly,
  onEdit,
}: {
  lang: string;
  value: string;
  readOnly?: boolean;
  onEdit?: (value?: string) => void;
}): ReactElement {
  const { resolvedTheme } = useTheme();
  return (
    <MonacoEditor
      height="40vh"
      language={lang}
      theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
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
}
