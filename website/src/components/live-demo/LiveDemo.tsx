import { ReactElement, useEffect, useState } from 'react';
import { Image, useTheme } from '@theguild/components';
import Select from 'react-select';
import { icons } from '@/lib/plugins';
import { EXAMPLES } from './examples';
import { generate } from './generate';
import { LiveDemoEditors } from './LiveDemoEditors';

const groupedExamples = Object.entries(EXAMPLES).map(([catName, category]) => ({
  label: catName,
  options: category.map((t, index) => ({ ...t, selectId: `${catName}__${index}` })),
}));

function useCodegen(config: string | undefined, schema: string | undefined, documents: string | undefined, templateName: string) {
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<{filename: string, content: string}[] | null>(null);

  useEffect(() => {
    if (!config) return;
    generate(config, schema, documents).then(result => {
      if (typeof result === 'string') {
        setOutput(null);
        setError(result);
      } else {
        setOutput(result);
        setError(null);
      }
    });
  }, [config, schema, documents, templateName]);

  return { error, output };
}

const DEFAULT_EXAMPLE = {
  catName: 'TypeScript',
  index: 0,
} as const;

export default function LiveDemo(): ReactElement {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';
  const [template, setTemplate] = useState(`${DEFAULT_EXAMPLE.catName}__${DEFAULT_EXAMPLE.index}`);
  const [schema, setSchema] = useState<string | undefined>(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].schema);
  const [documents, setDocuments] = useState<string | undefined>(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].documents);
  const [config, setConfig] = useState<string | undefined>(EXAMPLES[DEFAULT_EXAMPLE.catName][DEFAULT_EXAMPLE.index].config);
  const { output, error } = useCodegen(config, schema, documents, template);

  const changeTemplate = (value: string | undefined) => {
    if (!value) return;
    const [catName, index] = value.split('__');
    setSchema(EXAMPLES[catName][Number(index)].schema);
    setDocuments(EXAMPLES[catName][Number(index)].documents);
    setConfig(EXAMPLES[catName][Number(index)].config);
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
            [&>div>div>div]:dark:text-gray-200
            [&>div]:dark:bg-black
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
          onChange={e => changeTemplate(e?.selectId)}
          getOptionValue={o => o.selectId}
          getOptionLabel={o => (
            <div className="flex items-center justify-end gap-1.5">
              <span className="mr-auto">{o.name}</span>
              {o.tags?.map(t => {
                const icon = icons[t as keyof typeof icons];
                return icon ? (
                  <Image alt='Icon' key={t} src={icon} placeholder="empty" loading="eager" className="max-h-[20px] w-auto" />
                ) : (
                  <span key={t} className="rounded-lg bg-gray-200 px-2 text-xs text-gray-800">
                    {t}
                  </span>
                );
              })}
            </div>
            // fix react-select types
          ) as any as string}
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
