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
  tags: Tags[];
}

enum Tags {
  client = 'Client',
  server = 'Server',
  typescript = 'TypeScript',
  angular = 'Angular',
  react = 'React',
  mongodb = 'MongoDB'
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
    tags: [Tags.typescript, Tags.client, Tags.server]
  },
  {
    name: `TypeScript Client ${chalk.italic('(operations and fragments)')}`,
    package: 'graphql-codegen-typescript-client',
    value: 'typescript-client',
    tags: [Tags.typescript, Tags.client]
  },
  {
    name: `TypeScript Server ${chalk.italic('(GraphQL Schema)')}`,
    package: 'graphql-codegen-typescript-server',
    value: 'typescript-server',
    tags: [Tags.typescript, Tags.client, Tags.server]
  },
  {
    name: `TypeScript Resolvers ${chalk.italic('(strongly typed resolve functions)')}`,
    package: 'graphql-codegen-typescript-resolvers',
    value: 'typescript-resolvers',
    tags: [Tags.typescript, Tags.server]
  },
  {
    name: `TypeScript Apollo Angular ${chalk.italic('(GQL services)')}`,
    package: 'graphql-codegen-typescript-apollo-angular',
    value: 'typescript-apollo-angular',
    tags: [Tags.typescript, Tags.angular, Tags.client]
  },
  {
    name: `TypeScript React Apollo ${chalk.italic('(typed components and HOCs)')}`,
    package: 'graphql-codegen-typescript-react-apollo',
    value: 'typescript-react-apollo',
    tags: [Tags.typescript, Tags.react, Tags.client]
  },
  {
    name: `TypeScript MongoDB ${chalk.italic('(typed MongoDB objects)')}`,
    package: 'graphql-codegen-typescript-mongodb',
    value: 'typescript-mongodb',
    tags: [Tags.typescript, Tags.mongodb, Tags.server]
  },
  {
    name: `TypeScript GraphQL files modules ${chalk.italic('(declarations for .graphql files)')}`,
    package: 'graphql-codegen-graphql-files-modules',
    value: 'typescript-graphql-files-modules',
    tags: [Tags.typescript, Tags.client]
  }
];

const targets = [Tags.client, Tags.server];

interface CommonAnswers {
  config: string;
  plugins: PluginOption[];
  schema: string;
  output: string;
  script: string;
  introspection: boolean;
}

interface ServerAnswers extends CommonAnswers {
  target: Tags.server;
}

interface ClientAnswers extends CommonAnswers {
  target: Tags.client;
  documents: string;
}

type Answers = ServerAnswers | ClientAnswers;

export async function init() {
  log(`
    Welcome to ${chalk.bold('GraphQL Code Generator')}!
    Answer few questions and we will setup everything for you.
  `);

  const answers = await inquirer.prompt<Answers>([
    {
      type: 'list',
      name: 'target',
      message: 'What is your target?',
      choices: targets
    },
    {
      type: 'input',
      name: 'schema',
      message: 'How can I access the schema?:',
      suffix: chalk.grey(' (path or url)'),
      default: 'https://localhost:4000', // matches Apollo Server's default
      validate: (str: string) => str.length > 0
    },
    {
      type: 'input',
      name: 'documents',
      message: 'Where can I find operations and fragments?:',
      when: answers => answers.target === Tags.client,
      default: '**/*.graphql',
      validate: (str: string) => str.length > 0
    },
    {
      type: 'checkbox',
      name: 'plugins',
      message: 'Pick plugins:',
      choices: answers => {
        return plugins
          .filter(p => p.tags.includes(answers.target))
          .map(p => {
            return {
              name: p.name,
              value: p
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
    documents: answers.target === Tags.client ? answers.documents : null,
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
