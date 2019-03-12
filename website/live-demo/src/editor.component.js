import React from 'react';

export class Editor extends React.Component {
  async componentDidMount() {
    const [{ default: CodeMirror }] = await Promise.all([
      import('codemirror'),
      import('codemirror/addon/lint/lint'),
      import('codemirror/addon/lint/yaml-lint'),
      import('codemirror/addon/hint/show-hint'),
      import('codemirror/addon/comment/comment'),
      import('codemirror/addon/edit/matchbrackets'),
      import('codemirror/addon/edit/closebrackets'),
      import('codemirror/addon/fold/foldgutter'),
      import('codemirror/addon/fold/brace-fold'),
      import('codemirror/addon/search/search'),
      import('codemirror/addon/search/searchcursor'),
      import('codemirror/addon/search/jump-to-line'),
      import('codemirror/addon/dialog/dialog'),
      import('codemirror/addon/lint/lint'),
      import('codemirror/mode/yaml/yaml'),
      import('codemirror/mode/javascript/javascript'),
      import('codemirror/keymap/sublime'),
      import('codemirror-graphql/hint'),
      import('codemirror-graphql/lint'),
      import('codemirror-graphql/info'),
      import('codemirror-graphql/jump'),
      import('codemirror-graphql/mode')
    ]);
    this.editor = CodeMirror(this._node, {
      value: this.props.value || '',
      lineNumbers: true,
      tabSize: 2,
      mode: this.props.lang,
      keyMap: 'sublime',
      autoCloseBrackets: true,
      matchBrackets: true,
      indentWithTabs: false,
      indentUnit: 2,
      showCursorWhenSelecting: true,
      readOnly: this.props.readOnly ? 'nocursor' : false,
      gutters: ['CodeMirror-lint-markers']
    });

    this.editor.on('change', this._onEdit);
  }

  _onEdit = () => {
    this.cachedValue = this.editor.getValue();

    if (this.props.onEdit) {
      this.props.onEdit(this.cachedValue);
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value && this.props.value !== this.cachedValue) {
      this.cachedValue = this.props.value;
      this.editor.setValue(this.props.value);
    }
  }

  render() {
    return (
      <div
        className="query-editor"
        ref={node => {
          this._node = node;
        }}
      />
    );
  }
}
