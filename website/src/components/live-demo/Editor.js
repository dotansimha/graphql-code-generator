import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

let CodeMirror = null;

if (ExecutionEnvironment.canUseDOM) {
  CodeMirror = require('codemirror');
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
  require('codemirror/keymap/sublime');
  require('codemirror-graphql/hint');
  require('codemirror-graphql/lint');
  require('codemirror-graphql/info');
  require('codemirror-graphql/jump');
  require('codemirror-graphql/mode');
}

import React from 'react';
import classes from './styles.module.css';
import useThemeContext from '@theme/hooks/useThemeContext';

export const Editor = ({ value, lang, readOnly, onEdit }) => {
  if (CodeMirror === null) {
    return null;
  }

  const elementRef = React.useRef(null);
  const [editorRef, setEditorRef] = React.useState(null);
  const { isDarkTheme } = useThemeContext();
  const theme = isDarkTheme ? 'nord' : 'neo';

  if (editorRef === null && elementRef.current !== null) {
    const instance = CodeMirror(elementRef.current, {
      value: value || '',
      theme,
      lineNumbers: true,
      tabSize: 2,
      mode: lang,
      keyMap: 'sublime',
      matchBrackets: true,
      indentWithTabs: false,
      indentUnit: 2,
      showCursorWhenSelecting: true,
      readOnly: readOnly ? 'nocursor' : false,
      gutters: ['CodeMirror-lint-markers'],
    });

    setEditorRef(instance);

    instance.on('change', editorInstance => {
      onEdit(editorInstance.getValue());
    });
  }

  if (editorRef) {
    editorRef.setOption('theme', theme);
  }

  if (editorRef !== null && editorRef.getValue() !== value) {
    editorRef.setValue(value);
  }

  return <div className={classes.queryEditor} ref={elementRef} />;
};
