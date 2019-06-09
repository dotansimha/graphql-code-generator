import React, { useState } from 'react';
import { Editor } from './Editor';
import { safeLoad } from 'js-yaml';
import MagicIcon from './magic.svg';
import CodegenLogo from './logo.svg';
import GraphQLLogo from './GraphQL_Logo.svg';
import { EXAMPLES } from './examples';
import { MenuItem, Select, FormControl, InputLabel, StyledComponentProps, makeStyles } from '@material-ui/core';
import { createStyles } from '@material-ui/styles';
import { getMode } from './formatter';
import { generate } from './generate';

const DEFAULT_EXAMPLE = 'typescript';

const useStyles = makeStyles(() =>
  createStyles({
    picker: {
      paddingLeft: 30,
      paddingBottom: 5,
      whiteSpace: 'nowrap',
    },
    container: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'stretch',
      borderTop: '1px solid #e5e5e5',
      marginTop: 3,
    },
    column: {
      flex: 1,
      height: '85vh',
      minWidth: '22vw',
      maxWidth: '22vw',
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fontStretch: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: '#33475c',
      height: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: '1px solid #e5e5e5',
    },
    logo: {
      height: 35,
      width: 35,
      marginRight: 3,
    },
    iconText: {
      flex: 0,
    },
    generateButton: {
      marginLeft: 5,
      marginRight: 5,
      width: '90%',
      height: 40,
      borderRadius: 5,
      boxShadow: '6px 6px 0 0 rgba(51, 71, 92, 0.09)',
      backgroundColor: '#ec51ba',
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontStretch: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textAlign: 'center',
      color: '#ffffff',
      cursor: 'pointer',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
);

const App: React.FC<StyledComponentProps> = () => {
  const classes = useStyles();
  const [template, setTemplate] = useState<string>(DEFAULT_EXAMPLE);
  const [schema, setSchema] = useState<string>(EXAMPLES[DEFAULT_EXAMPLE].schema);
  const [documents, setDocuments] = useState<string>(EXAMPLES[DEFAULT_EXAMPLE].documents);
  const [config, setConfig] = useState<string>(EXAMPLES[DEFAULT_EXAMPLE].config);
  const [output, setOutput] = useState<string | null>(null);
  const exec = async (eConfig: string, eSchema: string, eDocuments: string) => {
    const result = await generate(eConfig, eSchema, eDocuments);
    setOutput(result);
  };
  const changeTemplate = (name: string) => {
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
        <FormControl>
          <InputLabel htmlFor={'example'}>Choose Example</InputLabel>
          <Select value={template} onChange={e => changeTemplate(e.target.value as string)}>
            {Object.keys(EXAMPLES).map(name => (
              <MenuItem key={name} value={name}>
                {EXAMPLES[name].name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className={classes.container}>
        <div className={classes.column}>
          <div className={classes.title}>
            <img className={classes.logo} alt={'GraphQL'} src={GraphQLLogo} />
            <span className={classes.iconText}>Schema</span>
          </div>
          <Editor lang={'graphql'} onEdit={setSchema} value={schema} />
        </div>
        <div className={classes.column}>
          <div className={classes.title}>
            <img className={classes.logo} alt={'GraphQL'} src={GraphQLLogo} />
            <span className={classes.iconText}>Documents</span>
          </div>
          <Editor lang={'graphql'} onEdit={setDocuments} value={documents} />
        </div>
        <div className={classes.column}>
          <div className={classes.title}>
            <img className={classes.logo} alt={'Codegen'} src={CodegenLogo} />
            <span className={classes.iconText}>Config</span>
          </div>
          <Editor lang={'yaml'} onEdit={setConfig} value={config} />
        </div>
        <div className={classes.column} style={{ minWidth: '34vw', maxWidth: '34vw' }}>
          <div className={classes.title}>
            <button onClick={() => exec(config, schema, documents)} className={classes.generateButton}>
              <span className={'generate-text'}>Generate</span>
              <img src={MagicIcon} alt={'Generate'} />
            </button>
          </div>
          <Editor lang={mode} onEdit={() => null} value={output || ''} />
        </div>
      </div>
    </div>
  );
};

export default App;
