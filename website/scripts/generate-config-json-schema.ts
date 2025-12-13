import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import jsonPath from 'jsonpath';
import prettier from 'prettier';
import { transformDocs } from '../src/lib/transform';

const MARKDOWN_JSDOC_KEY = 'exampleMarkdown';
const DEFAULT_JSDOC_KEY = 'default';
const CWD = process.cwd();
const OUT_PATH = join(CWD, 'public/config.schema.json');

const prettierOptions = prettier.resolveConfig.sync(CWD);

async function generate(): Promise<void> {
  const { schema } = transformDocs();
  // Remove non-standard keys
  jsonPath.apply(schema, `$..${MARKDOWN_JSDOC_KEY}`, () => undefined);

  // Remove default to avoid annoying auto-complete
  jsonPath.apply(schema, `$..*`, v => {
    if (v && typeof v === 'object' && v[DEFAULT_JSDOC_KEY] !== undefined) {
      if (!v.description) {
        v.description = '';
      }

      v.description += `\nDefault value: "${v.default}"`;
      delete v.default;
    }
    return v;
  });
  const prettifiedSchema = prettier.format(JSON.stringify(schema), { ...prettierOptions, parser: 'json' });
  await writeFile(OUT_PATH, prettifiedSchema);
}

generate()
  .then(() => {
    console.log('✅  Done!');
  })
  .catch(e => {
    console.error(e);
  });
