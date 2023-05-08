import { ReactElement, useEffect, useState } from 'react';
import { Image } from '@theguild/components';
import { load } from 'js-yaml';
import { Editor } from './Editor';
import { Config, getMode } from './formatter';
import codegenLogo from '../../../public/assets/img/gql-codegen-icon.svg';
import graphqlLogo from '../../../public/assets/img/GraphQL_Logo.svg';
import classnames from 'classnames';
import { basename } from 'path';

const classes = {
  title: 'flex gap-1 justify-center font-bold h-12 items-center font-mono border-b dark:border-neutral-800',
  column: 'w-[22vw]',
};

const READ_ONLY_DOCUMENTS_TEXT = `# This example isn't\n# using GraphQL operations`;

export interface LiveDemoEditorsProps {
  setSchema: (newText: string | undefined) => void;
  schema: string | undefined;
  setDocuments: (newText: string | undefined) => void;
  documents: string | undefined;
  setConfig: (newText: string | undefined) => void;
  config: string | undefined;
  error: string | undefined;
  output: { filename: string; content: string }[] | null;
}

export function LiveDemoEditors({
  setSchema,
  schema,
  setDocuments,
  documents,
  setConfig,
  config,
  error,
  output,
}: LiveDemoEditorsProps): ReactElement {
  const [index, setIndex] = useState(0);
  let mode: ReturnType<typeof getMode> = 'javascript';

  try {
    const parsedConfig = load(config || '') as Config;
    mode = getMode(parsedConfig);
  } catch (e) {
    console.error(e);
  }

  useEffect(() => {
    setIndex(0);
  }, [output]);

  return (
    <div className="flex">
      <div className={classes.column}>
        <div className={classes.title}>
          <Image alt="GraphQL logo" src={graphqlLogo} placeholder="empty" loading="eager" className="h-7 w-7" />
          schema.graphql
        </div>
        <Editor lang="graphql" onEdit={setSchema} value={schema} />
      </div>
      <div className={classes.column}>
        <div className={classes.title}>
          <Image alt="GraphQL logo" src={graphqlLogo} placeholder="empty" loading="eager" className="h-7 w-7" />
          operation.graphql
        </div>
        <Editor
          lang="graphql"
          onEdit={newText => {
            setDocuments(newText !== READ_ONLY_DOCUMENTS_TEXT ? newText : undefined);
          }}
          value={documents === undefined ? READ_ONLY_DOCUMENTS_TEXT : documents}
          readOnly={documents === undefined}
        />
      </div>
      <div className={classes.column}>
        <div className={classes.title}>
          <Image alt="Codegen logo" src={codegenLogo} placeholder="empty" loading="eager" className="h-7 w-7" />
          codegen.yml
        </div>
        <Editor lang="yaml" onEdit={setConfig} value={config} />
      </div>
      <div className="w-[32vw]">
        <div className="flex h-12 items-end">
          {output?.map((outputItem, i) => (
            <button
              onClick={() => setIndex(i)}
              key={outputItem.filename}
              className={classnames(
                'h-2/3 min-w-[30%] rounded-t-md px-2 text-center font-mono text-xs font-bold',
                index === i && 'bg-neutral-800 text-white'
              )}
            >
              {basename(outputItem.filename)}
            </button>
          ))}
        </div>
        <Editor readOnly lang={mode} value={error || output?.[index].content || ''} />
      </div>
    </div>
  );
}
