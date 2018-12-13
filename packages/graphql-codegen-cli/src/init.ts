import * as inquirer from 'inquirer';
import chalk from 'chalk';
import { Types } from 'graphql-codegen-core';
import { resolve, relative } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import * as YAML from 'json-to-pretty-yaml';
import * as detectIndent from 'detect-indent';

interface PluginOption {
  name: string;
  package: string;
  value: string;
  available(tags: Tags[]): boolean;
}

enum Tags {
  client = 'Client',
  server = 'Server',
  typescript = 'TypeScript',
  angular = 'Angular',
  react = 'React'
}

function log(...msgs: string[]) {
  // tslint:disable-next-line
  console.log(...msgs);
}

const plugins: Array<PluginOption> = [
  {
    name: `TypeScript Common ${chalk.italic('(required by client and server plugins)')}`,
    package: 'graphql-codegen-typescript-common',
    value: 'typescript-common',
    available: () => true
  },
  {
    name: `TypeScript Client ${chalk.italic('(operations and fragments)')}`,
    package: 'graphql-codegen-typescript-client',
    value: 'typescript-client',
    available: tags => tags.some(tag => [Tags.client].includes(tag))
  },
  {
    name: `TypeScript Server ${chalk.italic('(GraphQL Schema)')}`,
    package: 'graphql-codegen-typescript-server',
    value: 'typescript-server',
    available: tags => tags.some(tag => [Tags.client, Tags.server].includes(tag))
  },
  {
    name: `TypeScript Resolvers ${chalk.italic('(strongly typed resolve functions)')}`,
    package: 'graphql-codegen-typescript-resolvers',
    value: 'typescript-resolvers',
    available: tags => tags.some(tag => [Tags.server].includes(tag))
  },
  {
    name: `TypeScript Apollo Angular ${chalk.italic('(GQL services)')}`,
    package: 'graphql-codegen-typescript-apollo-angular',
    value: 'typescript-apollo-angular',
    available: tags => {
      const hasAngular = tags.includes(Tags.angular);
      const noReact = !tags.includes(Tags.react);

      return hasAngular && noReact;
    }
  },
  {
    name: `TypeScript React Apollo ${chalk.italic('(typed components and HOCs)')}`,
    package: 'graphql-codegen-typescript-react-apollo',
    value: 'typescript-react-apollo',
    available: tags => {
      const hasReact = tags.includes(Tags.react);
      const noAngular = !tags.includes(Tags.angular);

      return hasReact && noAngular;
    }
  },
  {
    name: `TypeScript MongoDB ${chalk.italic('(typed MongoDB objects)')}`,
    package: 'graphql-codegen-typescript-mongodb',
    value: 'typescript-mongodb',
    available: tags => tags.includes(Tags.server)
  },
  {
    name: `TypeScript GraphQL files modules ${chalk.italic('(declarations for .graphql files)')}`,
    package: 'graphql-codegen-graphql-files-modules',
    value: 'typescript-graphql-files-modules',
    available: tags => tags.includes(Tags.client)
  },
  {
    name: `Introspection Fragment Matcher ${chalk.italic('(for Apollo Client)')}`,
    package: 'graphql-codegen-fragment-matcher',
    value: 'fragment-matcher',
    available: tags => tags.includes(Tags.client)
  }
];

interface Answers {
  targets: Tags[];
  config: string;
  plugins: PluginOption[];
  schema: string;
  documents?: string;
  output: string;
  script: string;
  introspection: boolean;
}

export async function init() {
  log(`
    Welcome to ${chalk.bold('GraphQL Code Generator')}!
    Answer few questions and we will setup everything for you.
  `);

  const possibleTargets = await guessTargets();

  function normalizeTargets(targets: Tags[] | Tags[][]): Tags[] {
    return [].concat(...targets);
  }

  const answers = await inquirer.prompt<Answers>([
    {
      type: 'checkbox',
      name: 'targets',
      message: `What type of application are you building?`,
      choices: [
        {
          name: 'Backend - API or server',
          key: 'backend',
          value: [Tags.server],
          checked: possibleTargets.Server
        },
        {
          name: 'Application built with Angular',
          key: 'angular',
          value: [Tags.angular, Tags.client],
          checked: possibleTargets.Angular
        },
        {
          name: 'Application built with React',
          key: 'react',
          value: [Tags.react, Tags.client],
          checked: possibleTargets.React
        },
        {
          name: 'Application built with other framework or vanilla JS',
          key: 'client',
          value: [Tags.client],
          checked: false
        }
      ]
    },
    {
      type: 'input',
      name: 'schema',
      message: 'Where is your schema?:',
      suffix: chalk.grey(' (path or url)'),
      default: 'https://localhost:4000', // matches Apollo Server's default
      validate: (str: string) => str.length > 0
    },
    {
      type: 'input',
      name: 'documents',
      message: 'Where are your operations and fragments?:',
      when: answers => {
        // flatten targets
        // I can't find an API in Inquirer that would do that
        answers.targets = normalizeTargets(answers.targets);

        return answers.targets.includes(Tags.client);
      },
      default: '**/*.graphql',
      validate: (str: string) => str.length > 0
    },
    {
      type: 'checkbox',
      name: 'plugins',
      message: 'Pick plugins:',
      choices: answers => {
        return plugins
          .filter(p => p.available(answers.targets))
          .map<inquirer.ChoiceType>(p => {
            return {
              name: p.name,
              value: p,
              checked: p.value === 'typescript-common'
            };
          });
      },
      validate: (plugins: any[]) => plugins.length > 0
    },
    {
      type: 'input',
      name: 'output',
      message: 'Where to write the output:',
      default: 'src/generated/graphql.ts',
      validate: (str: string) => str.length > 0
    },
    {
      type: 'confirm',
      name: 'introspection',
      message: 'Do you want to generate an introspection file?'
    },
    {
      type: 'input',
      name: 'config',
      message: 'How to name the config file?',
      default: 'codegen.yml',
      validate: (str: string) => {
        const isNotEmpty = str.length > 0;
        const hasCorrectExtension = ['json', 'yml', 'yaml'].some(ext => str.toLocaleLowerCase().endsWith(`.${ext}`));

        return isNotEmpty && hasCorrectExtension;
      }
    },
    {
      type: 'input',
      name: 'script',
      message: 'What script in package.json should run the codegen?',
      validate: (str: string) => str.length > 0
    }
  ]);

  // define config
  const config: Types.Config = {
    overwrite: true,
    schema: answers.schema,
    documents: answers.targets.includes(Tags.client) ? answers.documents : null,
    generates: {
      [answers.output]: {
        plugins: answers.plugins.map(p => p.value)
      }
    }
  };

  // introspection
  if (answers.introspection) {
    addIntrospection(config);
  }

  // config file
  const { relativePath } = writeConfig(answers, config);

  // write package.json
  writePackage(answers, relativePath);

  // Emit status to the terminal
  log(`
    Config file generated at ${chalk.bold(relativePath)}
    
      ${chalk.bold('$ npm install')}

    To install the plugins.

      ${chalk.bold(`$ npm run ${answers.script}`)}

    To run GraphQL Code Generator.
  `);
}

// adds an introspection to `generates`
function addIntrospection(config: Types.Config) {
  config.generates['./graphql.schema.json'] = {
    plugins: ['introspection']
  };
}

// Parses config and writes it to a file
function writeConfig(answers: Answers, config: Types.Config) {
  const ext = answers.config.toLocaleLowerCase().endsWith('.json') ? 'json' : 'yml';
  const content = ext === 'json' ? JSON.stringify(config) : YAML.stringify(config);
  const fullPath = resolve(process.cwd(), answers.config);
  const relativePath = relative(process.cwd(), answers.config);

  writeFileSync(fullPath, content, {
    encoding: 'utf-8'
  });

  return {
    relativePath,
    fullPath
  };
}

// Updates package.json (script and plugins as dependencies)
function writePackage(answers: Answers, configLocation: string) {
  // script
  const pkgPath = resolve(process.cwd(), 'package.json');
  const pkgContent = readFileSync(pkgPath, {
    encoding: 'utf-8'
  });
  const pkg = JSON.parse(pkgContent);
  const { indent } = detectIndent(pkgContent);

  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  pkg.scripts[answers.script] = `gql-gen --config ${configLocation}`;

  // plugin
  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }

  // read codegen's version
  const { version } = JSON.parse(
    readFileSync(resolve(__dirname, '../package.json'), {
      encoding: 'utf-8'
    })
  );

  answers.plugins.forEach(plugin => {
    pkg.devDependencies[plugin.package] = version;
  });

  writeFileSync(pkgPath, JSON.stringify(pkg, null, indent));
}

async function guessTargets(): Promise<Record<Tags, boolean>> {
  const pkg = JSON.parse(
    readFileSync(resolve(process.cwd(), 'package.json'), {
      encoding: 'utf-8'
    })
  );
  const dependencies = Object.keys({
    ...pkg.dependencies,
    ...pkg.devDependencies
  });

  return {
    [Tags.angular]: isAngular(dependencies),
    [Tags.react]: isReact(dependencies),
    [Tags.client]: false,
    [Tags.server]: false,
    [Tags.typescript]: isTypescript(dependencies)
  };
}

function isAngular(dependencies: string[]): boolean {
  return dependencies.includes('@angular/core');
}

function isReact(dependencies: string[]): boolean {
  return dependencies.includes('react');
}

function isTypescript(dependencies: string[]): boolean {
  return dependencies.includes('typescript');
}
