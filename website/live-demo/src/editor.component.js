import React from 'react';
import CodeMirror from 'codemirror';

export class Editor extends React.Component {
  componentDidMount() {
    this.editor = CodeMirror(this._node, {
      value: this.props.value || '',
      lineNumbers: true,
      tabSize: 2,
      mode: this.props.lang,
      keyMap: 'sublime',
      autoCloseBrackets: true,
      matchBrackets: true,
      showCursorWhenSelecting: true,
      readOnly: this.props.readOnly ? 'nocursor' : false,
      gutters: ['CodeMirror-lint-markers'],
      lint: true
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
