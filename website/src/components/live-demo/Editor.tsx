import { FC } from 'react';
import { useThemeContext } from '@theguild/components';
import MonacoEditor from '@monaco-editor/react';
import { canUseDOM } from '../../utils';

const Editor: FC<{ lang: string; value: string; readOnly?: boolean; onEdit: (value?: string) => void }> = ({
  value,
  lang,
  readOnly,
  onEdit,
}) => {
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
      onChange={newValue => onEdit(newValue)}
    />
  );
};

export default Editor;
