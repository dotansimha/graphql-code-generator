import CodeMirror from 'codemirror';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/yaml-lint';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/lint/lint';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/keymap/sublime';
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/info';
import 'codemirror-graphql/jump';
import 'codemirror-graphql/mode';
import React from 'react';
import classes from './styles.module.css';
import useThemeContext from '@theme/hooks/useThemeContext';

export const Editor = ({ value, lang, readOnly, onEdit }) => {
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
