import path from 'path';
import { executeCodegen } from '@graphql-codegen/cli';
import * as nearOperationFilePreset from '@graphql-codegen/near-operation-file-preset';
import * as typescriptOperationsPlugin from '../src/index.js';

const fixturesDir = path.join(__dirname, 'fixtures/issue-11026');

const runCodegen = (omitOperationSuffix: boolean) =>
  executeCodegen({
    cwd: fixturesDir,
    schema: /* GraphQL */ `
      type Query {
        ping: Widget
      }

      type Widget {
        title: Markdown
      }

      type Markdown {
        markdown: String
      }
    `,
    documents: ['markdown.ts', 'op.ts'],
    pluginLoader: async name => {
      if (name === '@graphql-codegen/typescript-operations') {
        return typescriptOperationsPlugin;
      }
      return import(name);
    },
    generates: {
      './': {
        preset: nearOperationFilePreset,
        presetConfig: {
          extension: '.generated.ts',
          baseTypesPath: 'globalTypes.ts',
        },
        plugins: ['typescript-operations'],
        config: {
          omitOperationSuffix,
          inlineFragmentTypes: 'combine',
        },
      },
    },
  });

describe('TypeScript Operations Plugin - near-operation-file preset', () => {
  it('Issue #11026 - imports fragment used by another fragment in the same file when omitOperationSuffix=true', async () => {
    const { result } = await runCodegen(true);

    const opFile = result.find(file => file.filename.endsWith('op.generated.ts'));
    expect(opFile.content).toContain(
      `export type WidgetFragment = { title: MarkdownFragment | null };`,
    );
    expect(opFile.content).toMatch(
      /import (type )?\{ MarkdownFragment \} from '\.\/markdown\.generated';/,
    );
  });

  it('control: imports fragment used by another fragment in the same file when omitOperationSuffix=false', async () => {
    const { result } = await runCodegen(false);

    const opFile = result.find(file => file.filename.endsWith('op.generated.ts'));
    expect(opFile.content).toMatch(
      /import (type )?\{ MarkdownFragmentFragment \} from '\.\/markdown\.generated';/,
    );
  });
});
