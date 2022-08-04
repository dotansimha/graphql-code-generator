import { FC } from 'react';
import Image from 'next/image';
import Editor from './Editor';
import CodegenOutput from './CodegenOutput';
import classes from './styles.module.css';

const LiveDemoEditors: FC = ({
  setSchema,
  schema,
  setDocuments,
  documents,
  setConfig,
  config,
  mode,
  error,
  output,
}) => {
  return (
    <>
      <div className={classes.column}>
        <div className={classes.title}>
          <Image alt="GraphQL" src="/assets/img/GraphQL_Logo.svg" width={30} height={30} />
          <span className={classes.iconText}>schema.graphql</span>
        </div>
        <Editor lang="graphql" onEdit={setSchema} value={schema} />
      </div>
      <div className={classes.column}>
        <div className={classes.title}>
          <Image alt="GraphQL" src="/assets/img/GraphQL_Logo.svg" width={30} height={30} />
          <span className={classes.iconText}>operation.graphql</span>
        </div>
        <Editor
          lang="graphql"
          onEdit={setDocuments}
          value={documents || `# This example isn't\n# using GraphQL operations`}
        />
      </div>
      <div className={classes.column}>
        <div className={classes.title}>
          <Image alt="Codegen" src="/assets/img/gql-codegen-icon.svg" width={30} height={30} />
          <span className={classes.iconText}>codegen.yml</span>
        </div>
        <Editor lang="yaml" onEdit={setConfig} value={config} />
      </div>
      <div className={classes.column} style={{ minWidth: '34vw', maxWidth: '34vw' }}>
        <CodegenOutput
          editorProps={{
            lang: mode,
            readOnly: true,
          }}
          error={error}
          outputArray={output}
        />
      </div>
    </>
  );
};

export default LiveDemoEditors;
