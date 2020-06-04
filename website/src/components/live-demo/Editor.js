import React from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

let MonacoEditor = () => <div />;

if (ExecutionEnvironment.canUseDOM) {
  MonacoEditor = require('react-monaco-editor').default;
}

export const Editor = ({ value, lang, readOnly, onEdit }) => {
  const { isDarkTheme } = useThemeContext();
  const options = {
    readOnly,
    minimap: {
      enabled: false,
    },
  };

  return (
    <MonacoEditor
      height="400"
      language={lang}
      theme={isDarkTheme ? 'vs-dark' : 'vs'}
      value={value}
      options={options}
      onChange={newValue => onEdit(newValue)}
    />
  );
};
