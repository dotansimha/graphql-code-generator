import React from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
// import CodegenYamlSchema from '../../../static/config.schema.json';

let MonacoEditor = () => <div />;

if (ExecutionEnvironment.canUseDOM) {
  MonacoEditor = require('@monaco-editor/react').default;
  // const { languages } = require('@monaco-editor/react/esm/vs/editor/editor.api');

  // if (languages.yaml && languages.yaml.yamlDefaults) {
  //   languages.yaml.yamlDefaults.setDiagnosticsOptions({
  //     validate: true,
  //     enableSchemaRequest: true,
  //     hover: true,
  //     completion: true,
  //     schemas: [
  //       {
  //         uri: 'http://codegen/schema.json',
  //         fileMatch: ['*'],
  //         schema: {
  //           id: 'http://codegen/schema.json',
  //           ...CodegenYamlSchema
  //         },
  //       }
  //     ]
  //   });
  // }
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
      height="400px"
      language={lang}
      theme={isDarkTheme ? 'vs-dark' : 'vs'}
      value={value}
      options={options}
      onChange={newValue => onEdit(newValue)}
    />
  );
};
