import { useState, useEffect, ReactElement } from 'react';
import { useTheme, Image } from '@theguild/components';
import Select from 'react-select';
import { EXAMPLES } from './examples';
import { icons } from '@/lib/plugins';
import { generate } from './generate';
import LiveDemoEditors from './LiveDemoEditors';

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

export default function LiveDemo(): ReactElement {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const [template, setTemplate] = useState(`${DEFAULT_EXAMPLE.catName}__${DEFAULT_EXAMPLE.index}`);
  const [schema, setSchema] = useState(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].schema);
  const [documents, setDocuments] = useState(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].documents);
  const [config, setConfig] = useState(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].config);
  const { output, error } = useCodegen(config, schema, documents, template);

  const changeTemplate = (value: string) => {
    const [catName, index] = value.split('__');
    setSchema(EXAMPLES[catName][index].schema);
    setDocuments(EXAMPLES[catName][index].documents);
    setConfig(EXAMPLES[catName][index].config);
    setTemplate(value);
  };

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
              {o.tags?.map(t => {
                const icon = icons[t];
                return icon ? (
                  <Image key={t} src={icon} placeholder="empty" loading="eager" className="max-h-[20px] w-auto" />
                ) : (
                  <span key={t} className="rounded-lg bg-gray-200 px-2 text-xs text-gray-800">
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
      <LiveDemoEditors
        setSchema={setSchema}
        schema={schema}
        setDocuments={setDocuments}
        documents={documents}
        setConfig={setConfig}
        config={config}
        error={error}
        output={output}
      />
    </div>
  );
}
