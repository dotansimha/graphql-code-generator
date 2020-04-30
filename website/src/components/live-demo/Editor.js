import React from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { Controlled as ReactCodeMirror } from 'react-codemirror2';
import useThemeContext from '@theme/hooks/useThemeContext';

if (ExecutionEnvironment.canUseDOM) {
  require('codemirror');
  require('codemirror/keymap/sublime');
  require('codemirror/addon/lint/lint');
  require('codemirror/addon/lint/yaml-lint');
  require('codemirror/addon/hint/show-hint');
  require('codemirror/addon/comment/comment');
  require('codemirror/addon/edit/matchbrackets');
  require('codemirror/addon/edit/closebrackets');
  require('codemirror/addon/fold/foldgutter');
  require('codemirror/addon/fold/brace-fold');
  require('codemirror/addon/search/search');
  require('codemirror/addon/search/searchcursor');
  require('codemirror/addon/search/jump-to-line');
  require('codemirror/addon/dialog/dialog');
  require('codemirror/addon/lint/lint');
  require('codemirror/mode/yaml/yaml');
  require('codemirror/mode/javascript/javascript');
  require('codemirror-graphql/hint');
  require('codemirror-graphql/lint');
  require('codemirror-graphql/info');
  require('codemirror-graphql/jump');
  require('codemirror-graphql/mode');
}

export const Editor = ({ value, lang, readOnly, onEdit }) => {
  const { isDarkTheme } = useThemeContext();
  const options = {
    theme: isDarkTheme ? 'nord' : 'neo',
    lineNumbers: true,
    tabSize: 2,
    mode: lang,
    keyMap: 'sublime',
    matchBrackets: true,
    indentWithTabs: false,
    indentUnit: 2,
    showCursorWhenSelecting: true,
    readOnly: readOnly,
    gutters: ['CodeMirror-lint-markers'],
  };

  return <ReactCodeMirror value={value} onBeforeChange={(editor, data, value) => onEdit(value)} options={options} />;
};
