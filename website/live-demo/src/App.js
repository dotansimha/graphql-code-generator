import React, { Component } from 'react';
import './App.css';
import { Editor } from './editor.component';
import { executeCodegen } from 'graphql-code-generator';
import { safeLoad } from 'js-yaml';
import * as prettier from 'prettier/standalone';

const plugins = [
  require('prettier/parser-graphql'),
  require('prettier/parser-babylon'),
  require('prettier/parser-yaml'),
  require('prettier/parser-typescript')
];

const EXT_TO_FORMATTER = {
  ts: 'typescript',
  graphql: 'graphql',
  'd.ts': 'typescript',
  json: 'json'
};

const pluginsMap = {
  'graphql-codegen-typescript-common': require('graphql-codegen-typescript-common'),
  'graphql-codegen-typescript-client': require('graphql-codegen-typescript-client'),
  'graphql-codegen-typescript-server': require('graphql-codegen-typescript-server'),
  'graphql-codegen-add': require('graphql-codegen-add'),
  'graphql-codegen-time': require('graphql-codegen-time'),
  'graphql-codegen-introspection': require('graphql-codegen-introspection'),
  'graphql-codegen-schema-ast': require('graphql-codegen-schema-ast'),
  'graphql-codegen-typescript-apollo-angular': require('graphql-codegen-typescript-apollo-angular'),
  'graphql-codegen-typescript-graphql-files-modules': require('graphql-codegen-typescript-graphql-files-modules'),
  'graphql-codegen-typescript-mongodb': require('graphql-codegen-typescript-mongodb'),
  'graphql-codegen-typescript-react-apollo': require('graphql-codegen-typescript-react-apollo'),
  'graphql-codegen-typescript-resolvers': require('graphql-codegen-typescript-resolvers')
};

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

  prettify(str, config) {
    try {
      const out = Object.keys(config.generates)[0].split('.');
      const ext = out[out.length - 1];

      return prettier.format(str, { parser: EXT_TO_FORMATTER[ext] || 'typescript', plugins });
    } catch (e) {
      return str;
    }
  }

  generate = () => {
    const config = safeLoad(this.state.config || '');

    const fullConfig = {
      pluginLoader: m => pluginsMap[m] || null,
      schema: [this.state.schema],
      documents: this.state.documents,
      ...config
    };

    executeCodegen(fullConfig)
      .then(([{ content }]) => {
        this.setState({ output: this.prettify(content, config) });
      })
      .catch(e => {
        this.setState({
          output: `
        ${e.message}:
        
        ${e.details}
        `
        });
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
