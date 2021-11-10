import { useState, useEffect, Suspense, Fragment } from 'react';
import { load } from 'js-yaml';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Select from 'react-select';
// import ReactMarkdown from 'react-markdown';
import { useThemeContext } from '@theguild/components';
import { EXAMPLES, EXAMPLES_ICONS } from './examples';
import { getMode } from './formatter';
import { generate } from './generate';
import { Loading } from '../ui/Loading';
import LiveDemoEditors from './LiveDemoEditors';
import classes from './styles.module.css';

const ErrorBoundary = dynamic(import('./ErrorBoundary'), { ssr: false });

const groupedExamples = Object.entries(EXAMPLES).map(([catName, category]) => ({
  label: catName,
  options: category.map((t, index) => ({ ...t, selectId: `${catName}__${index}` })),
}));

function useCodegen(config: string, schema: string, documents?: string, templateName: string) {
  const [error, setError] = useState(null);
  const [output, setOutput] = useState(null);

  useEffect(() => {
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
} as const;

export const LiveDemo = () => {
  const { isDarkTheme } = useThemeContext();
  const [template, setTemplate] = useState(`${DEFAULT_EXAMPLE.catName}__${DEFAULT_EXAMPLE.index}`);
  const [schema, setSchema] = useState(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].schema);
  const [documents, setDocuments] = useState(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].documents);
  const [config, setConfig] = useState(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].config);
  const { output, error } = useCodegen(config, schema, documents, template);

  const changeTemplate = value => {
    const [catName, index] = value.split('__');
    setSchema(EXAMPLES[catName][index].schema);
    setDocuments(EXAMPLES[catName][index].documents);
    setConfig(EXAMPLES[catName][index].config);
    setTemplate(value);
  };

  let mode = null;

  try {
    const parsedConfig = load(config || '');
    mode = getMode(parsedConfig);
  } catch (e) {
    console.error(e);
  }

  // let description = null;
  //
  // if (template) {
  //   const [catName, index] = template.split('__');
  //   description = EXAMPLES[catName][index].description;
  // }

  return (
    <>
      <div className={classes.picker}>
        <h3>Choose Live Example: </h3>
        <div>
          <Select
            isSearchable={false}
            styles={{
              menu: styles => ({ ...styles, ...(isDarkTheme && { backgroundColor: 'black' }) }),
              control: styles => ({ ...styles, ...(isDarkTheme && { backgroundColor: 'black' }) }),
              container: styles => ({
                ...styles,
                display: 'inline-block',
                width: '100%',
                textAlign: 'left',
              }),
              option: (styles, { isFocused }) => ({
                ...styles,
                fontSize: 13,
                ...(isDarkTheme && isFocused && { backgroundColor: 'gray' }),
              }),
              singleValue: styles => ({
                ...styles,
                width: '100%',
                ...(isDarkTheme && { color: 'white' }),
              }),
            }}
            isMulti={false}
            isClearable={false}
            onChange={e => changeTemplate(e.selectId)}
            getOptionValue={o => o.selectId}
            getOptionLabel={o => (
              <>
                <span>{o.name}</span>
                <span className={classes.exampleTags}>
                  {o.tags?.map((t, index) => {
                    const icon = EXAMPLES_ICONS[t];
                    const key = `${o.name}_${index}`;
                    return icon ? (
                      <Fragment key={key}>
                        <Image priority height={18} width={18} alt={icon.alt} src={icon.src} />
                        &nbsp;
                      </Fragment>
                    ) : (
                      <span key={key} className={classes.exampleTag}>
                        {t}
                      </span>
                    );
                  })}
                </span>
              </>
            )}
            defaultValue={groupedExamples[0].options[0]}
            options={groupedExamples}
          />
          {/* TODO: Should I add this ? */}
          {/*<div className={classes.exampleDesc}>{description && <ReactMarkdown>{description}</ReactMarkdown>}</div>*/}
        </div>
      </div>
      <div className={classes.container}>
        <ErrorBoundary>
          <Suspense fallback={<Loading color={isDarkTheme ? '#fff' : '#000'} height="450px" />}>
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
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default LiveDemo;
