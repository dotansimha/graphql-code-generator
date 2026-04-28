import { resolve } from 'path';
import { fs, vol } from 'memfs';
import { screen } from '@inquirer/testing/vitest';
import { bold } from '../src/init/helpers.js';
import { init } from '../src/init/index.js';
import { getApplicationTypeChoices, getPluginChoices } from '../src/init/questions.js';
import { guessTargets } from '../src/init/targets.js';
import { Tags } from '../src/init/types.js';

vi.mock('../src/utils/get-latest-version.ts', () => {
  return { getLatestVersion: () => Promise.resolve('1.0.0') };
});

vi.mock('fs', () => require('./__mocks__/fs.cjs'));
const version = '888.888.888'; // Mocked CLI version, not important

const packageJson = {
  withAngular: JSON.stringify({
    version,
    dependencies: {
      '@angular/core': 'x.x.x',
    },
  }),
  withTypescript: JSON.stringify({
    version,
    devDependencies: {
      typescript: 'x.x.x',
    },
  }),
  withReact: JSON.stringify({
    version,
    dependencies: {
      react: 'x.x.x',
    },
  }),
  withFlow: JSON.stringify({
    version,
    devDependencies: {
      flow: 'x.x.x',
    },
  }),
  withStencil: JSON.stringify({
    version,
    dependencies: {
      '@stencil/core': 'x.x.x',
    },
  }),
  withVue: JSON.stringify({
    version,
    dependencies: {
      vue: 'x.x.x',
    },
  }),
  withReactQuery: JSON.stringify({
    version,
    dependencies: {
      '@tanstack/react-query': 'x.x.x',
    },
  }),
  withSWR: JSON.stringify({
    version,
    dependencies: {
      swr: 'x.x.x',
    },
  }),
  withGraphqlRequest: JSON.stringify({
    version,
    dependencies: {
      'graphql-request': 'x.x.x',
    },
  }),
};

describe('init', () => {
  beforeEach(() => {
    // make sure terminal don't get noisy
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vol.reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('guessTargets()', () => {
    it('should guess angular projects', () => {
      vol.fromJSON({ ['package.json']: packageJson.withAngular }, process.cwd());
      const targets = guessTargets();
      expect(targets.Angular).toEqual(true);
    });

    it('should guess typescript projects', () => {
      vol.fromJSON({ ['package.json']: packageJson.withTypescript }, process.cwd());
      const targets = guessTargets();
      expect(targets.TypeScript).toEqual(true);
    });

    it('should guess react projects', () => {
      vol.fromJSON({ ['package.json']: packageJson.withReact }, process.cwd());
      const targets = guessTargets();
      expect(targets.React).toEqual(true);
    });

    it('should guess stencil projects', () => {
      vol.fromJSON({ ['package.json']: packageJson.withStencil }, process.cwd());
      const targets = guessTargets();
      expect(targets.Stencil).toEqual(true);
    });

    it('should guess flow projects', () => {
      vol.fromJSON({ ['package.json']: packageJson.withFlow }, process.cwd());
      const targets = guessTargets();
      expect(targets.Flow).toEqual(true);
    });

    it('should guess vue projects', () => {
      vol.fromJSON({ ['package.json']: packageJson.withVue }, process.cwd());
      const targets = guessTargets();
      expect(targets.Vue).toEqual(true);
    });

    it('should guess graphql-request projects', () => {
      vol.fromJSON({ ['package.json']: packageJson.withGraphqlRequest }, process.cwd());
      const targets = guessTargets();
      expect(targets.graphqlRequest).toEqual(true);
    });
  });

  describe('plugins suggestions for client-side setup', () => {
    it('should use angular related plugins when @angular/core is found', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withAngular }, process.cwd());
      const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {}); // silent

      const result = init();

      // targets
      expect(screen.getScreen()).toMatchInlineSnapshot(`
      "? What type of application are you building?
        Backend - API or server
      ❯ Application built with Angular
        Application built with React
        Application built with Stencil
        Application built with Vue
        Application using graphql-request
        Application built with other framework or vanilla JS

      ↑↓ navigate • ⏎ select"
    `);
      screen.keypress('enter');
      await screen.next();

      // schema
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Where is your schema?: (path or url) (http://localhost:4000)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // documents
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Where are your operations and fragments?: (src/**/*.ts)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // plugins
      expect(screen.getScreen()).toMatchInlineSnapshot(`
      "? Pick plugins:
      ❯◯ Introspection Fragment Matcher (for Apollo Client)
       ◉ TypeScript Apollo Angular (typed GQL services)

      ↑↓ navigate • space select • a all • i invert • ⏎ submit"
    `);
      screen.keypress('enter');
      await screen.next();

      // output
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Where to write the output: (src/generated/graphql.ts)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // introspection
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Do you want to generate an introspection file? (y/N)"`,
      );
      screen.keypress('n');
      screen.keypress('enter');
      await screen.next();

      // config
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? How to name the config file? (codegen.ts)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // script
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? What script in package.json should run the codegen? (codegen)"`,
      );
      screen.keypress('enter');
      await result;

      expect(await screen.getFullOutput()).toMatchInlineSnapshot(
        `
      "✔ What type of application are you building? Application built with Angular
      ✔ Where is your schema?: (path or url) http://localhost:4000
      ✔ Where are your operations and fragments?: src/**/*.ts
      ✔ Pick plugins: TypeScript Apollo Angular (typed GQL services)
      ✔ Where to write the output: src/generated/graphql.ts
      ✔ Do you want to generate an introspection file? No
      ✔ How to name the config file? codegen.ts
      ✔ What script in package.json should run the codegen? codegen"
    `,
      );

      expect(logSpy.mock.calls[2][0]).toContain(`Config file generated at ${bold('codegen.ts')}`);

      expect(writeFileSpy).toHaveBeenCalledTimes(2);

      const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "@angular/core": "x.x.x",
          },
          "devDependencies": {
            "@graphql-codegen/cli": "1.0.0",
            "@graphql-codegen/typescript-apollo-angular": "1.0.0",
          },
          "scripts": {
            "codegen": "graphql-codegen --config codegen.ts",
          },
          "version": "888.888.888",
        }
      `);

      const configFile = writeFileSpy.mock.calls[0][0] as string;
      const config = writeFileSpy.mock.calls[0][1] as string;
      expect(config).toMatchInlineSnapshot(`
        "
        import type { CodegenConfig } from '@graphql-codegen/cli';

        const config: CodegenConfig = {
          overwrite: true,
          schema: "http://localhost:4000",
          documents: "src/**/*.ts",
          generates: {
            "src/generated/graphql.ts": {
              plugins: ["typescript-apollo-angular"]
            }
          }
        };

        export default config;
        "
      `);
      expect(configFile).toEqual(resolve(process.cwd(), 'codegen.ts'));
    });

    it('should use react related plugins when react is found', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withReact }, process.cwd());
      const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = init();

      // targets
      expect(screen.getScreen()).toMatchInlineSnapshot(`
      "? What type of application are you building?
        Backend - API or server
        Application built with Angular
      ❯ Application built with React
        Application built with Stencil
        Application built with Vue
        Application using graphql-request
        Application built with other framework or vanilla JS

      ↑↓ navigate • ⏎ select"
    `);
      screen.keypress('enter');
      await screen.next();

      // schema
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Where is your schema?: (path or url) (http://localhost:4000)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // documents
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Where are your operations and fragments?: (src/**/*.tsx)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // output
      expect(screen.getScreen()).toMatchInlineSnapshot(`"? Where to write the output: (src/gql/)"`);
      screen.keypress('enter');
      await screen.next();

      // introspection
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Do you want to generate an introspection file? (y/N)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // config
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? How to name the config file? (codegen.ts)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // script
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? What script in package.json should run the codegen? (codegen)"`,
      );
      screen.keypress('enter');
      await result;

      expect(await screen.getFullOutput()).toMatchInlineSnapshot(
        `
      "✔ What type of application are you building? Application built with React
      ✔ Where is your schema?: (path or url) http://localhost:4000
      ✔ Where are your operations and fragments?: src/**/*.tsx
      ✔ Where to write the output: src/gql/
      ✔ Do you want to generate an introspection file? No
      ✔ How to name the config file? codegen.ts
      ✔ What script in package.json should run the codegen? codegen"
    `,
      );

      expect(logSpy.mock.calls[2][0]).toContain(`Config file generated at codegen.ts`);

      expect(writeFileSpy).toHaveBeenCalledTimes(2);

      const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "react": "x.x.x",
          },
          "devDependencies": {
            "@graphql-codegen/cli": "1.0.0",
            "@graphql-codegen/client-preset": "1.0.0",
          },
          "scripts": {
            "codegen": "graphql-codegen --config codegen.ts",
          },
          "version": "888.888.888",
        }
      `);

      const configFile = writeFileSpy.mock.calls[0][0] as string;
      const config = writeFileSpy.mock.calls[0][1] as string;
      expect(configFile).toEqual(resolve(process.cwd(), 'codegen.ts'));
      expect(config).toMatchInlineSnapshot(`
        "
        import type { CodegenConfig } from '@graphql-codegen/cli';

        const config: CodegenConfig = {
          overwrite: true,
          schema: "http://localhost:4000",
          documents: "src/**/*.tsx",
          generates: {
            "src/gql/": {
              preset: "client",
              plugins: []
            }
          }
        };

        export default config;
        "
      `);
    });

    it('should use stencil related plugins when @stencil/core is found', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withStencil }, process.cwd());
      const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {}); // silent

      const result = init();

      // targets
      expect(screen.getScreen()).toMatchInlineSnapshot(`
      "? What type of application are you building?
        Backend - API or server
        Application built with Angular
        Application built with React
      ❯ Application built with Stencil
        Application built with Vue
        Application using graphql-request
        Application built with other framework or vanilla JS

      ↑↓ navigate • ⏎ select"
    `);
      screen.keypress('enter');
      await screen.next();

      // schema
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Where is your schema?: (path or url) (http://localhost:4000)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // documents
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Where are your operations and fragments?: (src/**/*.graphql)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // plugins
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `
      "? Pick plugins:
      ❯◉ TypeScript (required by other typescript plugins)
       ◉ TypeScript Operations (operations and fragments)
       ◉ TypeScript Stencil Apollo (typed components)
       ◯ TypeScript GraphQL files modules (declarations for .graphql files)
       ◯ TypeScript GraphQL document nodes (embedded GraphQL document)
       ◯ Introspection Fragment Matcher (for Apollo Client)
       ◯ Urql Introspection (for Urql Client)

      ↑↓ navigate • space select • a all • i invert • ⏎ submit"
    `,
      );
      screen.keypress('enter');
      await screen.next();

      // output
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Where to write the output: (src/generated/graphql.tsx)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // introspection
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Do you want to generate an introspection file? (y/N)"`,
      );
      screen.keypress('n');
      screen.keypress('enter');
      await screen.next();

      // config
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? How to name the config file? (codegen.ts)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // script
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? What script in package.json should run the codegen? (codegen)"`,
      );
      screen.keypress('enter');
      await result;

      expect(await screen.getFullOutput()).toMatchInlineSnapshot(
        `
        "✔ What type of application are you building? Application built with Stencil
        ✔ Where is your schema?: (path or url) http://localhost:4000
        ✔ Where are your operations and fragments?: src/**/*.graphql
        ✔ Pick plugins: TypeScript (required by other typescript plugins), TypeScript Operations (operations and fragments), TypeScript Stencil Apollo (typed components)
        ✔ Where to write the output: src/generated/graphql.tsx
        ✔ Do you want to generate an introspection file? No
        ✔ How to name the config file? codegen.ts
        ✔ What script in package.json should run the codegen? codegen"
      `,
      );

      expect(logSpy.mock.calls[2][0]).toContain(`Config file generated at codegen.ts`);

      expect(writeFileSpy).toHaveBeenCalledTimes(2);

      const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "@stencil/core": "x.x.x",
          },
          "devDependencies": {
            "@graphql-codegen/cli": "1.0.0",
            "@graphql-codegen/typescript": "1.0.0",
            "@graphql-codegen/typescript-operations": "1.0.0",
            "@graphql-codegen/typescript-stencil-apollo": "1.0.0",
          },
          "scripts": {
            "codegen": "graphql-codegen --config codegen.ts",
          },
          "version": "888.888.888",
        }
      `);

      const configFile = writeFileSpy.mock.calls[0][0] as string;
      const config = writeFileSpy.mock.calls[0][1] as string;
      expect(configFile).toEqual(resolve(process.cwd(), 'codegen.ts'));
      expect(config).toMatchInlineSnapshot(`
        "
        import type { CodegenConfig } from '@graphql-codegen/cli';

        const config: CodegenConfig = {
          overwrite: true,
          schema: "http://localhost:4000",
          documents: "src/**/*.graphql",
          generates: {
            "src/generated/graphql.tsx": {
              plugins: ["typescript", "typescript-operations", "typescript-stencil-apollo"]
            }
          }
        };

        export default config;
        "
      `);
    });
  });

  describe('plugins suggestions non client-side setup', () => {
    it('should use typescript related plugins when typescript is found (node)', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withTypescript }, process.cwd());
      const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {}); // silent

      const result = init();

      // targets
      expect(screen.getScreen()).toMatchInlineSnapshot(`
        "? What type of application are you building?
        ❯ Backend - API or server
          Application built with Angular
          Application built with React
          Application built with Stencil
          Application built with Vue
          Application using graphql-request
          Application built with other framework or vanilla JS

        ↑↓ navigate • ⏎ select"
      `);
      screen.keypress('enter');
      await screen.next();

      // schema
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Where is your schema?: (path or url) (http://localhost:4000)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // documents
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `
        "? Pick plugins:
        ❯◉ TypeScript (required by other typescript plugins)
         ◉ TypeScript Resolvers (strongly typed resolve functions)
         ◯ TypeScript MongoDB (typed MongoDB objects)
         ◯ TypeScript GraphQL document nodes (embedded GraphQL document)

        ↑↓ navigate • space select • a all • i invert • ⏎ submit"
      `,
      );
      screen.keypress('enter');
      await screen.next();

      // output
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Where to write the output: (src/generated/graphql.ts)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // introspection
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? Do you want to generate an introspection file? (y/N)"`,
      );
      screen.keypress('n');
      screen.keypress('enter');
      await screen.next();

      // config
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? How to name the config file? (codegen.ts)"`,
      );
      screen.keypress('enter');
      await screen.next();

      // script
      expect(screen.getScreen()).toMatchInlineSnapshot(
        `"? What script in package.json should run the codegen? (codegen)"`,
      );
      screen.keypress('enter');

      await result;

      expect(await screen.getFullOutput()).toMatchInlineSnapshot(
        `
        "✔ What type of application are you building? Backend - API or server
        ✔ Where is your schema?: (path or url) http://localhost:4000
        ✔ Pick plugins: TypeScript (required by other typescript plugins), TypeScript Resolvers (strongly typed resolve functions)
        ✔ Where to write the output: src/generated/graphql.ts
        ✔ Do you want to generate an introspection file? No
        ✔ How to name the config file? codegen.ts
        ✔ What script in package.json should run the codegen? codegen"
      `,
      );

      expect(logSpy.mock.calls[2][0]).toContain(`Config file generated at codegen.ts`);

      expect(writeFileSpy).toHaveBeenCalledTimes(2);

      const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "devDependencies": {
            "@graphql-codegen/cli": "1.0.0",
            "@graphql-codegen/typescript": "1.0.0",
            "@graphql-codegen/typescript-resolvers": "1.0.0",
            "typescript": "x.x.x",
          },
          "scripts": {
            "codegen": "graphql-codegen --config codegen.ts",
          },
          "version": "888.888.888",
        }
      `);

      const configFile = writeFileSpy.mock.calls[0][0] as string;
      const config = writeFileSpy.mock.calls[0][1] as string;
      expect(configFile).toEqual(resolve(process.cwd(), 'codegen.ts'));
      expect(config).toMatchInlineSnapshot(`
        "
        import type { CodegenConfig } from '@graphql-codegen/cli';

        const config: CodegenConfig = {
          overwrite: true,
          schema: "http://localhost:4000",
          generates: {
            "src/generated/graphql.ts": {
              plugins: ["typescript", "typescript-resolvers"]
            }
          }
        };

        export default config;
        "
      `);
    });
  });

  it('custom setup', async () => {
    vol.fromJSON({ ['package.json']: packageJson.withReact }, process.cwd());
    const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {}); // silent

    const result = init();

    // targets
    expect(screen.getScreen()).toMatchInlineSnapshot(`
      "? What type of application are you building?
        Backend - API or server
        Application built with Angular
      ❯ Application built with React
        Application built with Stencil
        Application built with Vue
        Application using graphql-request
        Application built with other framework or vanilla JS

      ↑↓ navigate • ⏎ select"
    `);
    screen.keypress('enter');
    await screen.next();

    // schema
    expect(screen.getScreen()).toMatchInlineSnapshot(
      `"? Where is your schema?: (path or url) (http://localhost:4000)"`,
    );
    screen.type('./schema.ts');
    screen.keypress('enter');
    await screen.next();

    // documents
    expect(screen.getScreen()).toMatchInlineSnapshot(
      `"? Where are your operations and fragments?: (src/**/*.tsx)"`,
    );
    screen.type('graphql/*.ts');
    screen.keypress('enter');
    await screen.next();

    // output
    expect(screen.getScreen()).toMatchInlineSnapshot(`"? Where to write the output: (src/gql/)"`);
    screen.type('graphql/index.ts');
    screen.keypress('enter');
    await screen.next();

    // introspection
    expect(screen.getScreen()).toMatchInlineSnapshot(
      `"? Do you want to generate an introspection file? (y/N)"`,
    );
    screen.type('y');
    screen.keypress('enter');
    await screen.next();

    // config
    expect(screen.getScreen()).toMatchInlineSnapshot(
      `"? How to name the config file? (codegen.ts)"`,
    );
    screen.type('app-codegen.yml');
    screen.keypress('enter');
    await screen.next();

    // script
    expect(screen.getScreen()).toMatchInlineSnapshot(
      `"? What script in package.json should run the codegen? (codegen)"`,
    );
    screen.type('generate:types');
    screen.keypress('enter');
    await result;

    expect(await screen.getFullOutput()).toMatchInlineSnapshot(
      `
      "✔ What type of application are you building? Application built with React
      ✔ Where is your schema?: (path or url) ./schema.ts
      ✔ Where are your operations and fragments?: graphql/*.ts
      ✔ Where to write the output: graphql/index.ts
      ✔ Do you want to generate an introspection file? Yes
      ✔ How to name the config file? app-codegen.yml
      ✔ What script in package.json should run the codegen? generate:types"
    `,
    );

    await result;

    expect(writeFileSpy).toHaveBeenCalledTimes(2);

    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
    expect(pkg).toMatchInlineSnapshot(`
      {
        "dependencies": {
          "react": "x.x.x",
        },
        "devDependencies": {
          "@graphql-codegen/cli": "1.0.0",
          "@graphql-codegen/client-preset": "1.0.0",
          "@graphql-codegen/introspection": "1.0.0",
        },
        "scripts": {
          "generate:types": "graphql-codegen --config app-codegen.yml",
        },
        "version": "888.888.888",
      }
    `);

    const configFile = writeFileSpy.mock.calls[0][0] as string;
    const config = writeFileSpy.mock.calls[0][1] as string;
    expect(configFile).toEqual(resolve(process.cwd(), 'app-codegen.yml'));
    expect(config).toMatchInlineSnapshot(`
      "overwrite: true
      schema: "./schema.ts"
      documents: "graphql/*.ts"
      generates:
        graphql/index.ts:
          preset: "client"
          plugins: []
        ./graphql.schema.json:
          plugins:
            - "introspection"
      "
    `);

    // logs
    const welcomeMsg = logSpy.mock.calls[0][0];
    const doneMsg = logSpy.mock.calls[2][0];
    expect(welcomeMsg).toMatchInlineSnapshot(`
      "
          Welcome to GraphQL Code Generator!
          Answer few questions and we will setup everything for you.
        "
    `);
    expect(doneMsg).toMatchInlineSnapshot(`
      "
          Config file generated at app-codegen.yml

            $ npm install

          To install the plugins.

            $ npm run generate:types

          To run GraphQL Code Generator.
        "
    `);
  });

  describe('plugin choices', () => {
    function getAvailable(tags: Tags[]): string[] {
      return getPluginChoices(tags).map((c: any) => c.value.value);
    }

    function getSelected(tags: Tags[]): string[] {
      return getPluginChoices(tags)
        .filter((c: any) => c.checked)
        .map((c: any) => c.value.value);
    }

    function getPlugins(targets: Tags[]) {
      const tags: Tags[] = getApplicationTypeChoices({
        [Tags.angular]: targets.includes(Tags.angular),
        [Tags.react]: targets.includes(Tags.react),
        [Tags.stencil]: targets.includes(Tags.stencil),
        [Tags.client]: targets.includes(Tags.client),
        [Tags.node]: targets.includes(Tags.node),
        [Tags.typescript]: targets.includes(Tags.typescript),
        [Tags.flow]: targets.includes(Tags.flow),
        [Tags.vue]: targets.includes(Tags.vue),
        [Tags.graphqlRequest]: targets.includes(Tags.graphqlRequest),
      })
        .filter(c => c.checked)
        .reduce((all, choice) => all.concat(choice.value), []);

      return {
        available: getAvailable(tags),
        selected: getSelected(tags),
      };
    }

    it('node', () => {
      const { available, selected } = getPlugins([Tags.node]);

      // available
      expect(available).toHaveLength(6);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-resolvers');
      expect(available).toContainEqual('typescript-mongodb');
      expect(available).toContainEqual('typescript-document-nodes');
      expect(available).toContainEqual('flow');
      expect(available).toContainEqual('flow-resolvers');
      // selected
      expect(selected).toHaveLength(0);
    });

    it('node + typescript', () => {
      const { selected, available } = getPlugins([Tags.node, Tags.typescript]);

      // available
      expect(available).toHaveLength(4);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-resolvers');
      expect(available).toContainEqual('typescript-mongodb');
      expect(available).toContainEqual('typescript-document-nodes');
      // selected
      expect(selected).toHaveLength(2);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-resolvers');
    });

    it('node + flow', () => {
      const { selected, available } = getPlugins([Tags.node, Tags.flow]);

      // available
      expect(available).toHaveLength(2);
      expect(available).toContainEqual('flow');
      expect(available).toContainEqual('flow-resolvers');
      // selected
      expect(selected).toHaveLength(2);
      expect(selected).toContainEqual('flow');
      expect(selected).toContainEqual('flow-resolvers');
    });

    it('angular', () => {
      const { selected, available } = getPlugins([Tags.angular]);

      // available
      expect(available).toHaveLength(2);
      expect(available).toEqual(['fragment-matcher', 'typescript-apollo-angular']);
      // selected
      expect(selected).toHaveLength(1);
      expect(selected).toEqual(['typescript-apollo-angular']);
    });

    it('react', () => {
      const { selected, available } = getPlugins([Tags.react]);

      // available
      expect(available).toHaveLength(2);
      expect(available).toContainEqual('fragment-matcher');
      expect(available).toContainEqual('urql-introspection');
      // selected
      expect(selected).toHaveLength(0);
    });

    it('react + flow', () => {
      const { selected, available } = getPlugins([Tags.react, Tags.flow]);

      // available
      expect(available).toHaveLength(4);
      expect(available).toContainEqual('flow');
      expect(available).toContainEqual('flow-operations');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(2);
      expect(selected).toContainEqual('flow');
      expect(selected).toContainEqual('flow-operations');
    });

    it('stencil', () => {
      const { selected, available } = getPlugins([Tags.stencil]);

      // available
      expect(available).toHaveLength(7);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-operations');
      expect(available).toContainEqual('typescript-stencil-apollo');
      expect(available).toContainEqual('typescript-graphql-files-modules');
      expect(available).toContainEqual('typescript-document-nodes');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(3);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-operations');
      expect(selected).toContainEqual('typescript-stencil-apollo');
    });
  });
});
