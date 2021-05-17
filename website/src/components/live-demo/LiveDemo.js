import React from 'react';
import { load } from 'js-yaml';
import { EXAMPLES, EXAMPLES_ICONS } from './examples';
import { getMode } from './formatter';
import { generate } from './generate';
import { Loading } from '../ui/Loading';
import classes from './styles.module.css';
import Select from 'react-select';
import useThemeContext from '@theme/hooks/useThemeContext';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ReactMarkdown from 'react-markdown';

const groupedExamples = Object.keys(EXAMPLES).map(catName => {
  return {
    label: catName,
    options: EXAMPLES[catName].map((t, index) => ({ ...t, selectId: `${catName}__${index}` })),
  };
});

function useCodegen(config, schema, documents, templateName) {
  const [error, setError] = React.useState(null);
  const [output, setOutput] = React.useState(null);

  async function run() {
    const result = await generate(config, schema, documents);

    if (typeof result === 'string') {
      setOutput(null);
      setError(result);
    } else {
      setOutput(result);
      setError(null);
    }
  }

  React.useEffect(() => {
    run();
  }, [config, schema, documents, templateName]);

  return {
    error,
    output,
  };
}

const DEFAULT_EXAMPLE = {
  catName: 'TypeScript',
  index: 0,
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback
      return <span>Something went wrong.</span>;
    }

    return this.props.children;
  }
}

export const LiveDemo = () => {
  const { isDarkTheme } = useThemeContext();
  const [template, setTemplate] = React.useState(`${DEFAULT_EXAMPLE.catName}__${DEFAULT_EXAMPLE.index}`);
  const [schema, setSchema] = React.useState(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].schema);
  const [documents, setDocuments] = React.useState(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].documents);
  const [config, setConfig] = React.useState(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].config);
  const { output, error } = useCodegen(config, schema, documents, template);

  const changeTemplate = value => {
    const [catName, index] = value.split('__');
    setSchema(EXAMPLES[catName][index].schema);
    setDocuments(EXAMPLES[catName][index].documents);
    setConfig(EXAMPLES[catName][index].config);
    setTemplate(value);
  };
  const LiveDemoEditors = React.lazy(() => import('./LiveDemoEditors'));

  let mode = null;

  try {
    const parsedConfig = load(config || '');
    mode = getMode(parsedConfig) || 'typescript';
    mode = mode === 'typescript' ? 'text/typescript' : mode;
  } catch (e) {}

  let description = null;

  if (template) {
    const [catName, index] = template.split('__');
    description = EXAMPLES[catName][index].description;
  }

  return (
    <div>
      <div className={classes.picker}>
        <div>
          <h3>Choose Live Example: </h3>
        </div>
        <div>
          <Select
            styles={{
              menu: styles => ({ ...styles, ...(isDarkTheme ? { backgroundColor: 'black' } : {}) }),
              control: styles => ({ ...styles, ...(isDarkTheme ? { backgroundColor: 'black' } : {}) }),
              container: styles => ({ ...styles, display: 'inline-block', width: '100%', textAlign: 'left' }),
              option: (styles, { isFocused }) => ({
                ...styles,
                fontSize: 13,
                ...(isDarkTheme && isFocused ? { backgroundColor: 'gray' } : {}),
              }),
              singleValue: styles => ({ ...styles, width: '100%', ...(isDarkTheme ? { color: 'white' } : {}) }),
            }}
            isMulti={false}
            isClearable={false}
            onChange={e => changeTemplate(e.selectId)}
            getOptionValue={o => o.selectId}
            getOptionLabel={o => {
              return (
                <>
                  <span>{o.name}</span>
                  <span className={classes.exampleTags}>
                    {o.tags && o.tags.length
                      ? o.tags.map((t, index) =>
                          EXAMPLES_ICONS[t] ? (
                            EXAMPLES_ICONS[t](`${o.name}_${index}`)
                          ) : (
                            <span key={`${o.name}_${index}`} className={classes.exampleTag}>
                              {t}
                            </span>
                          )
                        )
                      : null}
                  </span>
                </>
              );
            }}
            defaultValue={groupedExamples[0].options[0]}
            options={groupedExamples}
          />
          <div className={classes.exampleDesc}>{description ? <ReactMarkdown source={description} /> : null}</div>
        </div>
      </div>
      <div className={classes.container}>
        <BrowserOnly>
          {() => (
            <ErrorBoundary>
              <React.Suspense fallback={<Loading color={isDarkTheme ? '#fff' : '#000'} height="450px" />}>
                <LiveDemoEditors
                  setSchema={setSchema}
                  schema={schema}
                  setDocuments={setDocuments}
                  documents={documents}
                  setConfig={setConfig}
                  config={config}
                  mode={mode}
                  error={error}
                  output={output}
                />
              </React.Suspense>
            </ErrorBoundary>
          )}
        </BrowserOnly>
      </div>
    </div>
  );
};
