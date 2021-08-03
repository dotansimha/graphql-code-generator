import React from 'react';
import { useThemeContext } from '@theguild/components';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

let MonacoEditor = () => <div />;

if (ExecutionEnvironment.canUseDOM) {
  MonacoEditor = require('@monaco-editor/react').default;
}

export const Editor = ({ value, lang, readOnly, onEdit }) => {
  if (typeof window === 'undefined') {
    return null;
  }

  const { isDarkTheme } = useThemeContext();
  const options = {
    readOnly,
    minimap: {
      enabled: false,
    },
  };

  return (
    <MonacoEditor
      height="40vh"
      language={lang}
      theme={isDarkTheme ? 'vs-dark' : 'vs'}
      value={value}
      options={options}
      onChange={newValue => onEdit(newValue)}
    />
  );
};
