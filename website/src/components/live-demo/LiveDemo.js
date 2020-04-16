import React from 'react';
import { Editor } from './Editor';
import { safeLoad } from 'js-yaml';
import { EXAMPLES } from './examples';
import { getMode } from './formatter';
import { generate } from './generate';
import classes from './styles.module.css';
import { Button } from '../ui/Button';
// import useThemeContext from '@theme/hooks/useThemeContext';

const DEFAULT_EXAMPLE = 'typescript';

export const LiveDemo = () => {
  const [template, setTemplate] = React.useState(DEFAULT_EXAMPLE);
  const [schema, setSchema] = React.useState(EXAMPLES[DEFAULT_EXAMPLE].schema);
  const [documents, setDocuments] = React.useState(EXAMPLES[DEFAULT_EXAMPLE].documents);
  const [config, setConfig] = React.useState(EXAMPLES[DEFAULT_EXAMPLE].config);
  const [output, setOutput] = React.useState(null);
  const exec = async (eConfig, eSchema, eDocuments) => {
    const result = await generate(eConfig, eSchema, eDocuments);
    setOutput(result);
  };
  const changeTemplate = name => {
    setTemplate(name);
    setSchema(EXAMPLES[name].schema);
    setDocuments(EXAMPLES[name].documents);
    setConfig(EXAMPLES[name].config);
    exec(EXAMPLES[name].config, EXAMPLES[name].schema, EXAMPLES[name].documents);
  };

  if (output === null) {
    exec(config, schema, documents);
  }

  let mode = null;

  try {
    const parsedConfig = safeLoad(config || '');
    mode = getMode(parsedConfig) || 'typescript';
    mode = mode === 'typescript' ? 'text/typescript' : mode;
  } catch (e) {}

  return (
    <div>
      <div className={classes.picker}>
        Choose Example: <select value={template} onChange={e => changeTemplate(e.target.value)}>
          {Object.keys(EXAMPLES).map(name => (
            <option key={name} value={name}>
              {EXAMPLES[name].name}
            </option>
          ))}
        </select>
      </div>
      <div className={classes.container}>
        <div className={classes.column}>
          <div className={classes.title}>
            <img className={classes.logo} alt={'GraphQL'} src="/img/GraphQL_Logo.svg" />
            <span className={classes.iconText}>Schema</span>
          </div>
          <Editor lang={'graphql'} onEdit={setSchema} value={schema} />
        </div>
        <div className={classes.column}>
          <div className={classes.title}>
            <img className={classes.logo} alt={'GraphQL'} src="/img/GraphQL_Logo.svg" />
            <span className={classes.iconText}>Operations</span>
          </div>
          <Editor lang={'graphql'} onEdit={setDocuments} value={documents} />
        </div>
        <div className={classes.column}>
          <div className={classes.title}>
            <img className={classes.logo} alt={'Codegen'} src="/img/logo.svg" />
            <span className={classes.iconText}>codegen.yml</span>
          </div>
          <Editor lang={'yaml'} onEdit={setConfig} value={config} />
        </div>
        <div className={classes.column} style={{ minWidth: '34vw', maxWidth: '34vw' }}>
          <div className={classes.title}>
            <Button contained="true" className={classes.generateButton} onClick={() => exec(config, schema, documents)}>
              <img src="/img/magic.svg" alt={'Generate'} />
              <div className={classes.generateText}>Generate</div>
            </Button>
          </div>
          <Editor lang={mode} onEdit={() => null} value={output || ''} />
        </div>
      </div>
    </div>
  );
};
