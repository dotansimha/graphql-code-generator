import { ReactElement } from 'react';
import { useThemeContext } from '@theguild/components';
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
  const { isDarkTheme } = useThemeContext();

  if (!canUseDOM) {
    return null;
  }

  return (
    <MonacoEditor
      height="40vh"
      language={lang}
      theme={isDarkTheme ? 'vs-dark' : 'vs'}
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
