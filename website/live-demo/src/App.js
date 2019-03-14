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
import { pascalCase } from 'change-case';

const EXT_TO_FORMATTER = {
  ts: 'typescript',
  graphql: 'graphql',
  'd.ts': 'typescript',
  json: 'json'
};

const DEFAULT_EXAMPLE = 'typescript';

const getPrettierPlugins = async mode => {
  switch (mode) {
    case 'graphql':
      return [await import('prettier/parser-graphql')];
    case 'yaml':
      return [await import('prettier/parser-yaml')];
    case 'typescript':
      return [await import('prettier/parser-typescript')];
    default:
      return [await import('prettier/parser-babylon')];
  }
};

const pluginsMap = {
  'graphql-codegen-flow': () => import('graphql-codegen-flow'),
  'graphql-codegen-flow-operations': () => import('graphql-codegen-flow-operations'),
  'graphql-codegen-flow-resolvers': () => import('graphql-codegen-flow-resolvers'),
  'graphql-codegen-typescript': () => import('graphql-codegen-typescript'),
  'graphql-codegen-typescript-operations': () => import('graphql-codegen-typescript-operations'),
  'graphql-codegen-typescript-resolvers': () => import('graphql-codegen-typescript-resolvers'),
  'graphql-codegen-typescript-apollo-angular': () => import('graphql-codegen-typescript-apollo-angular'),
  'graphql-codegen-typescript-react-apollo': () => import('graphql-codegen-typescript-react-apollo'),
  'graphql-codegen-typescript-stencil-apollo': () => import('graphql-codegen-typescript-stencil-apollo'),
  'graphql-codegen-typescript-graphql-files-modules': () => import('graphql-codegen-typescript-graphql-files-modules'),
  'graphql-codegen-typescript-mongodb': () => import('graphql-codegen-typescript-mongodb'),
  'graphql-codegen-add': () => import('graphql-codegen-add'),
  'graphql-codegen-time': () => import('graphql-codegen-time'),
  'graphql-codegen-introspection': () => import('graphql-codegen-introspection'),
  'graphql-codegen-schema-ast': () => import('graphql-codegen-schema-ast')
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

  async prettify(str, config, tabWidth) {
    try {
      const mode = this.getMode(config) || 'typescript';
      const prettier = await import('prettier/standalone');
      return prettier.format(str, { parser: mode, plugins: await getPrettierPlugins(mode), tabWidth });
    } catch (e) {
      return str;
    }
  }

  generate = async () => {
    try {
      const cleanTabs = this.state.config.replace(/\t/g, '  ');
      const prettier = await import('prettier/standalone');
      const prettyYaml = prettier.format(cleanTabs, {
        parser: 'yaml',
        plugins: await getPrettierPlugins('yaml'),
        tabWidth: 2
      });
      const config = safeLoad(prettyYaml);
      config.namingConvention = pascalCase;

      const fullConfig = {
        pluginLoader: m => (m in pluginsMap ? pluginsMap[m]() : null || null),
        schema: [this.state.schema],
        documents: this.state.documents,
        ...config
      };
      const { executeCodegen } = await import('graphql-code-generator');
      const [{ content }] = await executeCodegen(fullConfig);
      this.setState({ output: await this.prettify(content, config) });
    } catch (e) {
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
