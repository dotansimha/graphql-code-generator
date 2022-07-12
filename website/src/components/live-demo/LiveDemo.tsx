import { useState, useEffect, Suspense, ReactElement } from 'react';
import { load } from 'js-yaml';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTheme } from '@theguild/components';
import Select from 'react-select';
import { EXAMPLES, EXAMPLES_ICONS } from './examples';
import { getMode } from './formatter';
import { generate } from './generate';
import { Loading } from '../ui/Loading';
import LiveDemoEditors from './LiveDemoEditors';

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

export const LiveDemo = (): ReactElement => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
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
    <div className="hidden lg:!block">
      <div className="mx-auto mb-4 w-1/2">
        <h3 className="mb-2 text-center">Choose Live Example:</h3>
        <Select
          isSearchable={false}
          className="
            rounded-md
            [&>div]:dark:bg-black
            [&>div>div>div]:dark:text-gray-200
          "
          styles={{
            option: (styles, { isFocused }) => ({
              ...styles,
              fontSize: 13,
              ...(isFocused && isDarkTheme && { backgroundColor: 'gray' }),
            }),
          }}
          isMulti={false}
          isClearable={false}
          onChange={e => changeTemplate(e.selectId)}
          getOptionValue={o => o.selectId}
          getOptionLabel={o => (
            <div className="flex items-center justify-end gap-1.5">
              <span className="mr-auto">{o.name}</span>
              {o.tags?.map((t, index) => {
                const icon = EXAMPLES_ICONS[t];
                const key = `${o.name}_${index}`;
                return icon ? (
                  <Image key={key} priority height={18} width={18} alt={icon.alt} src={icon.src} />
                ) : (
                  <span key={key} className="rounded-lg bg-gray-200 px-2 px-1 text-xs text-gray-800">
                    {t}
                  </span>
                );
              })}
            </div>
          )}
          defaultValue={groupedExamples[0].options[0]}
          options={groupedExamples}
        />
      </div>
      <div className="flex border-y border-gray-300">
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
    </div>
  );
};

export default LiveDemo;
