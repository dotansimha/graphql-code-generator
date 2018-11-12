import React, { Component } from 'react';
import './App.css';
import { Editor } from './editor.component';

class App extends Component {
  state = {
    output: '',
    config: `
generates:
  live-demo-test.ts:
    - typescript-common
    - typescript-client
    - typescript-server
    `,
    schema: `
type Query {
  f: String
}
    `,
    documents: `
query f {
  f
}
    `
  };

  update = field => value => this.setState({ [field]: value });

  generate = () => {
    fetch('http://localhost:9000/live-demo/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        schema: this.state.schema,
        config: this.state.config,
        documents: this.state.documents
      })
    })
      .then(r => r.text())
      .then(r => {
        this.update('output')(r);
      })
      .catch(e => {
        console.log('e', e);
      });
  };

  render() {
    return (
      <div className="container">
        <div className="column">
          <Editor lang={'graphql'} onEdit={this.update('schema')} value={this.state.schema} />
        </div>
        <div className="column">
          <Editor lang={'graphql'} onEdit={this.update('documents')} value={this.state.documents} />
        </div>
        <div className="column">
          <Editor lang={'yaml'} onEdit={this.update('config')} value={this.state.config} />
        </div>
        <div className="column">
          <button onClick={this.generate}>generate</button>
          <Editor readOnly={true} onEdit={this.update('output')} value={this.state.output} />
        </div>
      </div>
    );
  }
}

export default App;
