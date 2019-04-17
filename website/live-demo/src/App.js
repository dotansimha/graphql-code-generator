import React, { Component } from 'react';
import './App.css';
import { Editor } from './editor.component';
import { safeLoad } from 'js-yaml';
import MagicIcon from './magic.svg';
import CodegenLogo from './logo.svg';
import GraphQLLogo from './GraphQL_Logo.svg';
import { EXAMPLES } from './examples';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const EXT_TO_FORMATTER = {
  ts: 'typescript',
  graphql: 'graphql',
  'd.ts': 'typescript',
  json: 'json',
};

const DEFAULT_EXAMPLE = 'typescript';

function normalizeConfig(config) {
  if (typeof config === 'string') {
    return [{ [config]: {} }];
  } else if (Array.isArray(config)) {
    return config.map(plugin => (typeof plugin === 'string' ? { [plugin]: {} } : plugin));
  } else if (typeof config === 'object') {
    return Object.keys(config).reduce((prev, pluginName) => [...prev, { [pluginName]: config[pluginName] }], []);
  } else {
    return [];
  }
}

const pluginLoaderMap = {
  java: () => import('@graphql-codegen/java'),
  'java-resolvers': () => import('@graphql-codegen/java-resolvers'),
  'fragment-matcher': () => import('@graphql-codegen/fragment-matcher'),
  flow: () => import('@graphql-codegen/flow'),
  'flow-operations': () => import('@graphql-codegen/flow-operations'),
  'flow-resolvers': () => import('@graphql-codegen/flow-resolvers'),
  typescript: () => import('@graphql-codegen/typescript'),
  'typescript-compatibility': () => import('@graphql-codegen/typescript-compatibility'),
  'typescript-operations': () => import('@graphql-codegen/typescript-operations'),
  'typescript-resolvers': () => import('@graphql-codegen/typescript-resolvers'),
  'typescript-apollo-angular': () => import('@graphql-codegen/typescript-apollo-angular'),
  'typescript-react-apollo': () => import('@graphql-codegen/typescript-react-apollo'),
  'typescript-stencil-apollo': () => import('@graphql-codegen/typescript-stencil-apollo'),
  'typescript-graphql-files-modules': () => import('@graphql-codegen/typescript-graphql-files-modules'),
  'typescript-mongodb': () => import('@graphql-codegen/typescript-mongodb'),
  add: () => import('@graphql-codegen/add'),
  time: () => import('@graphql-codegen/time'),
  introspection: () => import('@graphql-codegen/introspection'),
  'schema-ast': () => import('@graphql-codegen/schema-ast'),
};

class App extends Component {
  state = {
    output: '',
    config: '',
    schema: '',
    documents: '',
    example: DEFAULT_EXAMPLE,
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

  generate = async () => {
    try {
      const cleanTabs = this.state.config.replace(/\t/g, '  ');
      const { generates, ...rootConfig } = safeLoad(cleanTabs);
      const filename = Object.keys(generates)[0];
      const plugins = normalizeConfig(generates[filename].plugins || generates[filename]);
      const { codegen } = await import('@graphql-codegen/core');
      const { parse } = await import('graphql');
      const pluginMap = {};
      for (const pluginElement of plugins) {
        const pluginName = Object.keys(pluginElement)[0];
        pluginMap[pluginName] = await pluginLoaderMap[pluginName]();
      }
      const output = await codegen({
        filename,
        plugins,
        schema: parse(this.state.schema),
        documents: this.state.documents
          ? [
              {
                content: parse(this.state.documents),
              },
            ]
          : [],
        config: {
          ...rootConfig,
        },
        pluginMap,
      });
      this.setState({ output });
    } catch (e) {
      console.log(e);
      if (e.details) {
        this.setState({
          output: `
    ${e.message}:
    
    ${e.details}
    `,
        });
      } else if (e.errors) {
        this.setState({
          output: e.errors
            .map(
              subError => `${subError.message}: 
${subError.details}`
            )
            .join('\n'),
        });
      } else {
        this.setState({
          output: e.message,
        });
      }
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
                id: 'example',
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
