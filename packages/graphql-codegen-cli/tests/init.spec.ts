import { resolve } from 'path';
import bddStdin from 'bdd-stdin';
import { fs, vol } from 'memfs';
import { bold } from '../src/init/helpers.js';
import { init } from '../src/init/index.js';
import { getApplicationTypeChoices, getPluginChoices } from '../src/init/questions.js';
import { guessTargets } from '../src/init/targets.js';
import { Tags } from '../src/init/types.js';

vi.mock('../src/utils/get-latest-version.ts', () => {
  return { getLatestVersion: () => Promise.resolve('1.0.0') };
});

vi.mock('fs', () => require('./__mocks__/fs.cjs'));
const { version } = require('../package.json');

const SELECT = ' '; // checkbox
const ENTER = '\n';
// const DOWN = bddStdin.keys.down;

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
    it('should guess angular projects', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withAngular }, process.cwd());
      const targets = await guessTargets();
      expect(targets.Angular).toEqual(true);
    });

    it('should guess typescript projects', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withTypescript }, process.cwd());
      const targets = await guessTargets();
      expect(targets.TypeScript).toEqual(true);
    });

    it('should guess react projects', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withReact }, process.cwd());
      const targets = await guessTargets();
      expect(targets.React).toEqual(true);
    });

    it('should guess stencil projects', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withStencil }, process.cwd());
      const targets = await guessTargets();
      expect(targets.Stencil).toEqual(true);
    });

    it('should guess flow projects', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withFlow }, process.cwd());
      const targets = await guessTargets();
      expect(targets.Flow).toEqual(true);
    });

    it('should guess vue projects', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withVue }, process.cwd());
      const targets = await guessTargets();
      expect(targets.Vue).toEqual(true);
    });

    it('should guess graphql-request projects', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withGraphqlRequest }, process.cwd());
      const targets = await guessTargets();
      expect(targets.graphqlRequest).toEqual(true);
    });
  });

  describe('plugins suggestions for client-side setup', () => {
    it('should use angular related plugins when @angular/core is found', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withAngular }, process.cwd());
      const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
      // silent
      vi.spyOn(console, 'log').mockImplementation(() => {});

      useInputs({
        onTarget: [ENTER], // confirm target
        onSchema: [ENTER], // use default
        onDocuments: [ENTER],
        onPlugins: [ENTER], // use selected packages
        onOutput: [ENTER], // use default output path
        onIntrospection: ['n', ENTER], // no introspection,
        onConfig: [ENTER], // use default config path
        onScript: ['graphql', ENTER], // use custom npm script
      });

      await init();

      expect(writeFileSpy).toHaveBeenCalledTimes(2);

      const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
      const config = writeFileSpy.mock.calls[0][1] as string;

      expect(config).toMatchSnapshot();

      // expected plugins
      expect(pkg.devDependencies).toEqual({
        '@graphql-codegen/cli': '1.0.0',
        '@graphql-codegen/typescript-apollo-angular': '1.0.0',
      });
    });

    it('should use react related plugins when react is found', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withReact }, process.cwd());
      const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
      // silent
      vi.spyOn(console, 'log').mockImplementation(() => {});

      useInputs({
        onTarget: [ENTER], // confirm react target
        onSchema: [ENTER], // use default
        onDocuments: [ENTER],
        onOutput: [ENTER], // use default output path
        onIntrospection: ['n', ENTER], // no introspection,
        onConfig: [ENTER], // use default config path
        onScript: ['graphql', ENTER], // use custom npm script
      });

      await init();

      expect(writeFileSpy).toHaveBeenCalledTimes(2);

      const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
      const config = writeFileSpy.mock.calls[0][1] as string;

      expect(config).toMatchSnapshot();

      // expected plugins
      expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/cli');
      expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/client-preset');
      // should not have other plugins
      expect(Object.keys(pkg.devDependencies)).toHaveLength(2);
    });

    it('should use stencil related plugins when @stencil/core is found', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withStencil }, process.cwd());
      const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
      // silent
      vi.spyOn(console, 'log').mockImplementation(() => {});

      useInputs({
        onTarget: [ENTER], // confirm stencil target
        onSchema: [ENTER], // use default
        onDocuments: [ENTER],
        onPlugins: [ENTER], // use selected packages
        onOutput: [ENTER], // use default output path
        onIntrospection: ['n', ENTER], // no introspection,
        onConfig: [ENTER], // use default config path
        onScript: ['graphql', ENTER], // use custom npm script
      });

      await init();

      expect(writeFileSpy).toHaveBeenCalledTimes(2);

      const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
      const config = writeFileSpy.mock.calls[0][1] as string;

      expect(config).toMatchSnapshot();

      // expected plugins
      expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript');
      expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-operations');
      expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-stencil-apollo');
      // should not have other plugins
      expect(Object.keys(pkg.devDependencies)).toHaveLength(4);
    });
  });

  describe('plugins suggestions non client-side setup', () => {
    it('should use typescript related plugins when typescript is found (node)', async () => {
      vol.fromJSON({ ['package.json']: packageJson.withTypescript }, process.cwd());
      const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
      // silent
      vi.spyOn(console, 'log').mockImplementation(() => {});

      useInputs({
        onTarget: [SELECT, ENTER], // confirm api target
        onSchema: [ENTER], // use default
        onPlugins: [ENTER], // use selected packages
        onOutput: [ENTER], // use default output path
        onIntrospection: ['n', ENTER], // no introspection,
        onConfig: [ENTER], // use default config path
        onScript: ['graphql', ENTER], // use custom npm script
      });

      await init();

      expect(writeFileSpy).toHaveBeenCalledTimes(2);

      const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
      const config = writeFileSpy.mock.calls[0][1] as string;

      expect(config).toMatchSnapshot();

      // expected plugins
      expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript');
      expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-resolvers');
      // should not have other plugins
      expect(Object.keys(pkg.devDependencies)).toHaveLength(4); // 3 - because we have typescript package in devDeps
    });
  });

  it('should have few default values for Angular', async () => {
    vol.fromJSON({ ['package.json']: packageJson.withReact }, process.cwd());
    const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const defaults = {
      config: 'codegen.ts',
    };

    useInputs({
      onTarget: [ENTER], // confirm angular target
      onSchema: [ENTER], // use default
      onDocuments: [ENTER],
      onOutput: [ENTER], // use default output path
      onIntrospection: [ENTER], // no introspection,
      onConfig: [ENTER], // use default config path
      onScript: ['graphql', ENTER], // use custom npm script
    });

    await init();

    const configFile = writeFileSpy.mock.calls[0][0] as string;
    const config = writeFileSpy.mock.calls[0][1] as string;
    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);

    expect(pkg.scripts.graphql).toEqual(`graphql-codegen --config codegen.ts`);
    expect(configFile).toEqual(resolve(process.cwd(), defaults.config));
    expect(config).toMatchSnapshot();
    expect(logSpy.mock.calls[2][0]).toContain(`Config file generated at ${bold(defaults.config)}`);
  });

  it('should have few default values for React', async () => {
    vol.fromJSON({ ['package.json']: packageJson.withReact }, process.cwd());
    const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const options = {
      script: 'graphql',
      schema: './schema.ts',
      documents: 'graphql/**/*.graphql',
      output: 'graphql/index.ts',
      config: 'app-codegen.yml',
    };

    useInputs({
      onTarget: [ENTER], // confirm target
      onSchema: [options.schema, ENTER], // use default
      onDocuments: [options.documents, ENTER],
      onOutput: [options.output, ENTER], // use default output path
      onIntrospection: ['y', ENTER], // with introspection,
      onConfig: [options.config, ENTER], // use default config path
      onScript: [options.script, ENTER], // use custom npm script
    });

    await init();

    const configFile = writeFileSpy.mock.calls[0][0] as string;
    const config = writeFileSpy.mock.calls[0][1] as string;
    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);

    expect(pkg.scripts[options.script]).toEqual(`graphql-codegen --config ${options.config}`);
    expect(configFile).toEqual(resolve(process.cwd(), options.config));
    expect(config).toMatchSnapshot();
    expect(logSpy.mock.calls[2][0]).toContain(`Config file generated at ${bold(options.config)}`);
  });

  it('custom setup', async () => {
    vol.fromJSON({ ['package.json']: packageJson.withReact }, process.cwd());

    const { init } = await import('../src/init/index.js');
    const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const documents = 'graphql/*.ts';
    const script = 'generate:types';

    useInputs({
      onTarget: [ENTER], // confirm target
      onSchema: [ENTER], // use default
      onDocuments: [documents, ENTER],
      onOutput: [ENTER], // use default output path
      onIntrospection: ['y', ENTER], // no introspection,
      onConfig: [ENTER], // use default config path
      onScript: [script, ENTER], // use custom npm script
    });

    await init();

    expect(writeFileSpy).toHaveBeenCalledTimes(2);

    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
    const config = writeFileSpy.mock.calls[0][1] as string;

    // config
    expect(config).toMatchSnapshot();

    // script name should match what we provided
    expect(pkg.scripts[script]).toEqual('graphql-codegen --config codegen.ts');
    // expected plugins
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/introspection');
    // should not have these plugins
    expect(pkg.devDependencies).not.toHaveProperty('@graphql-codegen/typescript-resolvers');

    // logs
    const welcomeMsg = logSpy.mock.calls[0][0];
    const doneMsg = logSpy.mock.calls[2][0];

    expect(welcomeMsg).toContain(`Welcome to ${bold('GraphQL Code Generator')}`);
    expect(doneMsg).toContain(`Config file generated at ${bold('codegen.ts')}`);
    expect(doneMsg).toContain(bold('$ npm install'));
    expect(doneMsg).toContain(bold(`$ npm run ${script}`));
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

function useInputs(inputs: {
  onTarget: string[];
  onSchema: string[];
  onDocuments?: string[];
  onPlugins?: string[];
  onOutput: string[];
  onIntrospection: string[];
  onConfig: string[];
  onScript: string[];
}) {
  bddStdin(
    [].concat(
      inputs.onTarget,
      inputs.onSchema,
      inputs.onDocuments || [],
      inputs.onPlugins || [],
      inputs.onOutput,
      inputs.onIntrospection,
      inputs.onConfig,
      inputs.onScript
    )
  );
}
