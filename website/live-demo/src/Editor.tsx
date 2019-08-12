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
import { makeStyles, createStyles } from '@material-ui/styles';

const useStyles = makeStyles(() =>
  createStyles({
    queryEditor: {
      flex: 1,
      position: 'relative',
      overflow: 'scroll',
    },
  })
);

export interface EditorProps {
  value: string;
  lang: string | null;
  readOnly?: boolean;
  onEdit: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, lang, readOnly, onEdit }) => {
  const classes = useStyles();
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [editorRef, setEditorRef] = React.useState<CodeMirror.Editor | null>(null);

  if (editorRef === null && elementRef.current !== null) {
    const instance = CodeMirror(elementRef.current, {
      value: value || '',
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

  if (editorRef !== null && editorRef.getValue() !== value) {
    editorRef.setValue(value);
  }

  return <div className={classes.queryEditor} ref={elementRef} />;
};
