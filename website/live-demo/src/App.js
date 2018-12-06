import React, { Component } from 'react';
import './App.css';
import { Editor } from './editor.component';
import { executeCodegen } from 'graphql-code-generator';
import { safeLoad } from 'js-yaml';
import * as prettier from 'prettier/standalone';
import MagicIcon from './magic.svg';
import CodegenLogo from './logo.svg';
import GraphQLLogo from './GraphQL_Logo.svg';
import { EXAMPLES } from './examples';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

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

const DEFAULT_EXAMPLE = 'typescript-client';

const pluginsMap = {
  'graphql-codegen-flow': require('graphql-codegen-flow'),
  'graphql-codegen-flow-documents': require('graphql-codegen-flow-documents'),
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
    config: '',
    schema: '',
    documents: '',
    example: DEFAULT_EXAMPLE
  };

  update = field => value => this.setState({ [field]: value });

  componentWillMount() {
    this.setState(EXAMPLES[DEFAULT_EXAMPLE].state);
  }

  componentDidMount() {
    this.generate();
  }

  getMode(config) {
    const out = Object.keys(config.generates)[0].split('.');
    const ext = out[out.length - 1];

    return EXT_TO_FORMATTER[ext];
  }

  prettify(str, config) {
    try {
      const mode = this.getMode(config) || 'typescript';

      return prettier.format(str, { parser: mode, plugins });
    } catch (e) {
      return str;
    }
  }

  generate = () => {
    try {
      const cleanTabs = this.state.config.replace(/\t/g, '  ');
      const prettyYaml = prettier.format(cleanTabs, { parser: 'yaml', plugins, tabWidth: 2 });
      const config = safeLoad(prettyYaml);

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
          if (e.details) {
            this.setState({
              output: `
        ${e.message}:
        
        ${e.details}
        `
            });
          } else if (e.errors) {
            this.setState({
              output: e.errors
                .map(
                  subError => `${subError.message}: 
  ${subError.details}`
                )
                .join('\n')
            });
          } else {
            this.setState({
              output: e.message
            });
          }
        });
    } catch (e) {
      this.setState({
        output: e.message
      });
    }
  };

  handleChange = event => {
    const key = event.target.value;
    this.setState({ example: key, ...EXAMPLES[key].state }, () => {
      this.generate();
    });
  };

  render() {
    let mode = null;

    try {
      const config = safeLoad(this.state.config || '');
      mode = this.getMode(config) || 'typescript';
      mode = mode === 'typescript' ? 'text/typescript' : mode;
    } catch (e) {}

    return (
      <div>
        <div className={'picker'}>
          <FormControl>
            <InputLabel htmlFor="example">Choose Example</InputLabel>
            <Select
              value={this.state.example}
              onChange={this.handleChange}
              inputProps={{
                name: 'example',
                id: 'example'
              }}
            >
              {Object.keys(EXAMPLES).map(name => (
                <MenuItem key={name} value={name}>
                  {EXAMPLES[name].name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="container">
          <div className="column" style={{ minWidth: '22vw', maxWidth: '22vw' }}>
            <div className="title">
              <img className="logo" alt={'GraphQL'} src={GraphQLLogo} />
              <span className={'icon-text'}>Schema</span>
            </div>
            <Editor lang={'graphql'} onEdit={this.update('schema')} value={this.state.schema} />
          </div>
          <div className="column" style={{ minWidth: '22vw', maxWidth: '22vw' }}>
            <div className="title">
              <img className="logo" alt={'GraphQL'} src={GraphQLLogo} />
              <span className={'icon-text'}>Documents</span>
            </div>
            <Editor lang={'graphql'} onEdit={this.update('documents')} value={this.state.documents} />
          </div>
          <div className="column" style={{ minWidth: '22vw', maxWidth: '22vw' }}>
            <div className="title">
              <img className="logo" alt={'Codegen'} src={CodegenLogo} />
              <span className={'icon-text'}>Config</span>
            </div>
            <Editor lang={'yaml'} onEdit={this.update('config')} value={this.state.config} />
          </div>
          <div className="column" style={{ minWidth: '34vw', maxWidth: '34vw' }}>
            <div className="title">
              <button onClick={this.generate}>
                <span className={'generate-text'}>Generate</span>
                <img src={MagicIcon} alt={'Generate'} />
              </button>
            </div>
            <Editor lang={mode} readOnly={true} onEdit={this.update('output')} value={this.state.output} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
