jest.mock('fs');
import * as bddStdin from 'bdd-stdin';
import { resolve } from 'path';
import { init } from '../src/init';
import { Tags } from '../src/init/types';
import { guessTargets } from '../src/init/targets';
import { plugins } from '../src/init/plugins';
import { bold } from '../src/init/helpers';
import { parseConfigFile } from '../src/yml';
import { getApplicationTypeChoices, getPluginChoices } from '../src/init/questions';
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
};

describe('init', () => {
  beforeEach(() => {
    // make sure terminal don't get noisy
    jest.spyOn(process.stdout, 'write').mockImplementation();
  });

  afterEach(() => {
    require('fs').__resetMockFiles();
    jest.clearAllMocks();
  });

  it('should guess angular projects', async () => {
    require('fs').__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    const targets = await guessTargets();
    expect(targets.Angular).toEqual(true);
  });

  it('should guess typescript projects', async () => {
    require('fs').__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withTypescript);
    const targets = await guessTargets();
    expect(targets.TypeScript).toEqual(true);
  });

  it('should guess react projects', async () => {
    require('fs').__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withReact);
    const targets = await guessTargets();
    expect(targets.React).toEqual(true);
  });

  it('should guess stencil projects', async () => {
    require('fs').__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withStencil);
    const targets = await guessTargets();
    expect(targets.Stencil).toEqual(true);
  });

  it('should guess flow projects', async () => {
    require('fs').__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withFlow);
    const targets = await guessTargets();
    expect(targets.Flow).toEqual(true);
  });

  it('should use angular related plugins when @angular/core is found', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    // silent
    jest.spyOn(console, 'log').mockImplementation();

    useInputs({
      onTarget: [ENTER], // confirm angular target
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
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);

    // should use default output path
    expect(config.generates['src/generated/graphql.ts']).toBeDefined();

    const output: any = config.generates['src/generated/graphql.ts'];
    expect(output.plugins).toContainEqual('typescript');
    expect(output.plugins).toContainEqual('typescript-operations');
    expect(output.plugins).toContainEqual('typescript-apollo-angular');
    expect(output.plugins).toHaveLength(3);

    // expected plugins
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript');
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-operations');
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-apollo-angular');
    // should not have other plugins
    expect(Object.keys(pkg.devDependencies)).toHaveLength(3);
  });

  it('should use react related plugins when react is found', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withReact);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    // silent
    jest.spyOn(console, 'log').mockImplementation();

    useInputs({
      onTarget: [ENTER], // confirm react target
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
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);

    // should use default output path
    expect(config.generates['src/generated/graphql.ts']).toBeDefined();

    const output: any = config.generates['src/generated/graphql.ts'];
    expect(output.plugins).toContainEqual('typescript');
    expect(output.plugins).toContainEqual('typescript-operations');
    expect(output.plugins).toContainEqual('typescript-react-apollo');
    expect(output.plugins).toHaveLength(3);

    // expected plugins
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript');
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-operations');
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-react-apollo');
    // should not have other plugins
    expect(Object.keys(pkg.devDependencies)).toHaveLength(3);
  });

  it('should use stencil related plugins when @stencil/core is found', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withStencil);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    // silent
    jest.spyOn(console, 'log').mockImplementation();

    useInputs({
      onTarget: [ENTER], // confirm angular target
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
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);

    // should use default output path
    expect(config.generates['src/generated/graphql.ts']).toBeDefined();

    const output: any = config.generates['src/generated/graphql.ts'];
    expect(output.plugins).toContainEqual('typescript');
    expect(output.plugins).toContainEqual('typescript-operations');
    expect(output.plugins).toContainEqual('typescript-stencil-apollo');
    expect(output.plugins).toHaveLength(3);

    // expected plugins
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript');
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-operations');
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-stencil-apollo');
    // should not have other plugins
    expect(Object.keys(pkg.devDependencies)).toHaveLength(3);
  });

  it('should use typescript related plugins when typescript is found (node)', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withTypescript);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    // silent
    jest.spyOn(console, 'log').mockImplementation();

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
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);

    // should use default output path
    expect(config.generates['src/generated/graphql.ts']).toBeDefined();

    const output: any = config.generates['src/generated/graphql.ts'];
    expect(output.plugins).toContainEqual('typescript');
    expect(output.plugins).toContainEqual('typescript-resolvers');
    expect(output.plugins).toHaveLength(2);

    // expected plugins
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript');
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-resolvers');
    // should not have other plugins
    expect(Object.keys(pkg.devDependencies)).toHaveLength(3); // 3 - because we have typescript package in devDeps
  });

  it('should have few default values', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const defaults = {
      schema: 'http://localhost:4000',
      documents: '**/*.graphql',
      output: 'src/generated/graphql.ts',
      config: 'codegen.yml',
    };

    useInputs({
      onTarget: [ENTER], // confirm angular target
      onSchema: [ENTER], // use default
      onDocuments: [ENTER],
      onPlugins: [ENTER], // use selected packages
      onOutput: [ENTER], // use default output path
      onIntrospection: ['n', ENTER], // no introspection,
      onConfig: [ENTER], // use default config path
      onScript: ['graphql', ENTER], // use custom npm script
    });

    await init();

    const configFile = writeFileSpy.mock.calls[0][0] as string;
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);
    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);

    expect(pkg.scripts['graphql']).toEqual(`graphql-codegen --config ${defaults.config}`);
    expect(configFile).toEqual(resolve(process.cwd(), defaults.config));
    expect(config.overwrite).toEqual(true);
    expect(config.schema).toEqual(defaults.schema);
    expect(config.documents).toEqual(defaults.documents);
    expect(config.generates[defaults.output]).toBeDefined();
    expect(logSpy.mock.calls[1][0]).toContain(`Config file generated at ${bold(defaults.config)}`);
  });

  it('should have few default values', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const options = {
      script: 'graphql',
      schema: './schema.ts',
      documents: 'graphql/**/*.graphql',
      output: 'graphql/index.ts',
      config: 'app-codegen.yml',
    };

    useInputs({
      onTarget: [ENTER], // confirm angular target
      onSchema: [options.schema, ENTER], // use default
      onDocuments: [options.documents, ENTER],
      onPlugins: [ENTER], // use selected packages
      onOutput: [options.output, ENTER], // use default output path
      onIntrospection: ['n', ENTER], // no introspection,
      onConfig: [options.config, ENTER], // use default config path
      onScript: [options.script, ENTER], // use custom npm script
    });

    await init();

    const configFile = writeFileSpy.mock.calls[0][0] as string;
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);
    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);

    expect(pkg.scripts[options.script]).toEqual(`graphql-codegen --config ${options.config}`);
    expect(configFile).toEqual(resolve(process.cwd(), options.config));
    expect(config.overwrite).toEqual(true);
    expect(config.schema).toEqual(options.schema);
    expect(config.documents).toEqual(options.documents);
    expect(config.generates[options.output]).toBeDefined();
    expect(logSpy.mock.calls[1][0]).toContain(`Config file generated at ${bold(options.config)}`);
  });

  it('custom setup', async () => {
    const fs = require('fs');
    fs.__setMockFiles(resolve(process.cwd(), 'package.json'), packageJson.withAngular);
    // make sure we don't write stuff
    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const documents = 'graphql/*.ts';
    const script = 'generate:types';

    useInputs({
      onTarget: [ENTER], // confirm angular target
      onSchema: [ENTER], // use default
      onDocuments: [documents, ENTER],
      onPlugins: [ENTER], // use selected packages
      onOutput: [ENTER], // use default output path
      onIntrospection: ['y', ENTER], // no introspection,
      onConfig: [ENTER], // use default config path
      onScript: [script, ENTER], // use custom npm script
    });

    await init();

    expect(writeFileSpy).toHaveBeenCalledTimes(2);

    const pkg = JSON.parse(writeFileSpy.mock.calls[1][1] as string);
    const config = parseConfigFile(writeFileSpy.mock.calls[0][1] as string);

    // config
    // should overwrite
    expect(config.overwrite).toEqual(true);
    // should match default schema
    expect(config.schema).toEqual('http://localhost:4000');
    // should match documents glob that we provided
    expect(config.documents).toEqual(documents);
    // should use default output path
    expect(config.generates['src/generated/graphql.ts']).toBeDefined();
    // should include introspection
    expect(config.generates['./graphql.schema.json']).toBeDefined();

    const output: any = config.generates['src/generated/graphql.ts'];
    expect(output.plugins).toContainEqual('typescript');
    expect(output.plugins).toContainEqual('typescript-operations');
    expect(output.plugins).toContainEqual('typescript-apollo-angular');

    // script name should match what we provided
    expect(pkg.scripts[script]).toEqual('graphql-codegen --config codegen.yml');
    // expected plugins
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript');
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-operations');
    expect(pkg.devDependencies).toHaveProperty('@graphql-codegen/typescript-apollo-angular');
    // should not have these plugins
    expect(pkg.devDependencies).not.toHaveProperty('@graphql-codegen/typescript-resolvers');

    // logs
    const welcomeMsg = logSpy.mock.calls[0][0];
    const doneMsg = logSpy.mock.calls[1][0];

    expect(welcomeMsg).toContain(`Welcome to ${bold('GraphQL Code Generator')}`);
    expect(doneMsg).toContain(`Config file generated at ${bold('codegen.yml')}`);
    expect(doneMsg).toContain(bold('$ npm install'));
    expect(doneMsg).toContain(bold(`$ npm run ${script}`));
  });

  describe('plugin choices', () => {
    function getAvailable(tags: Tags[]): string[] {
      return getPluginChoices({
        targets: tags,
      } as any).map((c: any) => c.value.value);
    }

    function getSelected(tags: Tags[]): string[] {
      return getPluginChoices({
        targets: tags,
      } as any)
        .filter((c: any) => c.checked)
        .map((c: any) => c.value.value);
    }

    function getPlugins(targets: Tags[]) {
      const tags: Tags[] = getApplicationTypeChoices({
        [Tags.angular]: targets.includes(Tags.angular),
        [Tags.react]: targets.includes(Tags.react),
        [Tags.stencil]: targets.includes(Tags.stencil),
        [Tags.browser]: targets.includes(Tags.browser),
        [Tags.node]: targets.includes(Tags.node),
        [Tags.typescript]: targets.includes(Tags.typescript),
        [Tags.flow]: targets.includes(Tags.flow),
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
      expect(available).toHaveLength(5);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-resolvers');
      expect(available).toContainEqual('typescript-mongodb');
      expect(available).toContainEqual('flow');
      expect(available).toContainEqual('flow-resolvers');
      // selected
      expect(selected).toHaveLength(0);
    });

    it('node + typescript', () => {
      const { selected, available } = getPlugins([Tags.node, Tags.typescript]);

      // available
      expect(available).toHaveLength(3);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-resolvers');
      expect(available).toContainEqual('typescript-mongodb');
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
      expect(available).toHaveLength(5);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-operations');
      expect(available).toContainEqual('typescript-apollo-angular');
      expect(available).toContainEqual('typescript-graphql-files-modules');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(3);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-operations');
      expect(selected).toContainEqual('typescript-apollo-angular');
    });

    it('react', () => {
      const { selected, available } = getPlugins([Tags.react]);

      // available
      expect(available).toHaveLength(7);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-operations');
      expect(available).toContainEqual('typescript-react-apollo');
      expect(available).toContainEqual('typescript-graphql-files-modules');
      expect(available).toContainEqual('flow');
      expect(available).toContainEqual('flow-operations');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(3);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-operations');
      expect(selected).toContainEqual('typescript-react-apollo');
    });

    it('react + typescript', () => {
      const { selected, available } = getPlugins([Tags.react, Tags.typescript]);

      // available
      expect(available).toHaveLength(5);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-operations');
      expect(available).toContainEqual('typescript-react-apollo');
      expect(available).toContainEqual('typescript-graphql-files-modules');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(3);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-operations');
      expect(selected).toContainEqual('typescript-react-apollo');
    });

    it('react + flow', () => {
      const { selected, available } = getPlugins([Tags.react, Tags.flow]);

      // available
      expect(available).toHaveLength(3);
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
      expect(available).toHaveLength(5);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-operations');
      expect(available).toContainEqual('typescript-stencil-apollo');
      expect(available).toContainEqual('typescript-graphql-files-modules');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(3);
      expect(selected).toContainEqual('typescript');
      expect(selected).toContainEqual('typescript-operations');
      expect(selected).toContainEqual('typescript-stencil-apollo');
    });

    it('vanilla', () => {
      const { selected, available } = getPlugins([Tags.browser]);

      // available
      expect(available).toHaveLength(6);
      expect(available).toContainEqual('typescript');
      expect(available).toContainEqual('typescript-operations');
      expect(available).toContainEqual('typescript-graphql-files-modules');
      expect(available).toContainEqual('flow');
      expect(available).toContainEqual('flow-operations');
      expect(available).toContainEqual('fragment-matcher');
      // selected
      expect(selected).toHaveLength(0);
    });
  });

  describe('plugins', () => {
    it('should have correct plugin and package names', async () => {});
    plugins.forEach(pkg => {
      const { name } = require(`../../plugins/${pkg.value}/package.json`);

      expect(pkg.package.replace('@graphql-codegen/', '')).toEqual(pkg.value);
      expect(pkg.package).toEqual(name);
    });
  });
});

function useInputs(inputs: { onTarget: string[]; onSchema: string[]; onDocuments?: string[]; onPlugins: string[]; onOutput: string[]; onIntrospection: string[]; onConfig: string[]; onScript: string[] }) {
  bddStdin([].concat(inputs.onTarget, inputs.onSchema, inputs.onDocuments || [], inputs.onPlugins, inputs.onOutput, inputs.onIntrospection, inputs.onConfig, inputs.onScript));
}
