import { ReactElement } from 'react';
import { Image } from '@theguild/components';
import { load } from 'js-yaml';
import CodegenOutput from './CodegenOutput';
import Editor from './Editor';
import { getMode } from './formatter';
import gqlCodegenIcon from '../../../public/assets/img/gql-codegen-icon.svg';
import graphqlLogo from '../../../public/assets/img/GraphQL_Logo.svg';
import classes from './styles.module.css';

const LiveDemoEditors = ({
  setSchema,
  schema,
  setDocuments,
  documents,
  setConfig,
  config,
  error,
  output,
}): ReactElement => {
  let mode = null;

  try {
    const parsedConfig = load(config || '');
    mode = getMode(parsedConfig);
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="flex">
      <div className={classes.column}>
        <div className={classes.title}>
          <Image alt="GraphQL" src={graphqlLogo} placeholder="empty" loading="eager" className="h-7 w-7" />
          <span className={classes.iconText}>schema.graphql</span>
        </div>
        <Editor lang="graphql" onEdit={setSchema} value={schema} />
      </div>
      <div className={classes.column}>
        <div className={classes.title}>
          <Image alt="GraphQL" src={graphqlLogo} placeholder="empty" loading="eager" className="h-7 w-7" />
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
          <Image alt="Codegen" src={gqlCodegenIcon} placeholder="empty" loading="eager" className="h-7 w-7" />
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
    </div>
  );
};

export default LiveDemoEditors;
