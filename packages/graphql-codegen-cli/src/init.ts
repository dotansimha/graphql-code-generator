import * as inquirer from 'inquirer';
import chalk from 'chalk';
import { Types } from 'graphql-codegen-core';
import { resolve, relative } from 'path';
import { writeFileSync } from 'fs';
import * as YAML from 'json-to-pretty-yaml';

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
    name: 'TypeScript Common',
    package: 'graphql-codegen-typescript-common',
    value: 'typescript-common',
    tags: [Tags.typescript, Tags.client, Tags.server]
  },
  {
    name: 'TypeScript Client',
    package: 'graphql-codegen-typescript-client',
    value: 'typescript-client',
    tags: [Tags.typescript, Tags.client]
  },
  {
    name: 'TypeScript Server',
    package: 'graphql-codegen-typescript-server',
    value: 'typescript-server',
    tags: [Tags.typescript, Tags.client, Tags.server]
  },
  {
    name: 'TypeScript Resolvers',
    package: 'graphql-codegen-typescript-resolvers',
    value: 'typescript-resolvers',
    tags: [Tags.typescript, Tags.server]
  },
  {
    name: 'TypeScript Apollo Angular',
    package: 'graphql-codegen-typescript-apollo-angular',
    value: 'typescript-apollo-angular',
    tags: [Tags.typescript, Tags.angular, Tags.client]
  },
  {
    name: 'TypeScript React Apollo',
    package: 'graphql-codegen-typescript-react-apollo',
    value: 'typescript-react-apollo',
    tags: [Tags.typescript, Tags.react, Tags.client]
  },
  {
    name: 'TypeScript MongoDB',
    package: 'graphql-codegen-typescript-mongodb',
    value: 'typescript-mongodb',
    tags: [Tags.typescript, Tags.mongodb, Tags.server]
  },
  {
    name: 'TypeScript GraphQL files modules',
    package: 'graphql-codegen-graphql-files-modules',
    value: 'typescript-graphql-files-modules',
    tags: [Tags.typescript, Tags.client]
  }
];

const targets = [Tags.client, Tags.server];

interface Answers {
  format: 'JSON' | 'YAML';
  target: Tags.client | Tags.server;
  plugins: Tags[];
  schema: string;
  hasDocuments: boolean;
  documents?: string;
  generate: string;
}

const askForFormat: inquirer.Question<Answers> = {
  type: 'list',
  name: 'format',
  message: 'In which format?',
  choices: ['JSON', 'YAML']
};

const askForTarget: inquirer.Question<Answers> = {
  type: 'list',
  name: 'target',
  message: 'Target?',
  choices: targets
};

const askForPlugins: inquirer.Question<Answers> = {
  type: 'checkbox',
  name: 'plugins',
  message: 'Pick plugins:',
  choices: answers => {
    return plugins
      .filter(p => p.tags.includes(answers.target))
      .map(p => {
        return {
          name: p.name,
          value: p.value
        };
      });
  },
  validate: (plugins: any[]) => plugins.length > 0
};

const askForSchema: inquirer.Question<Answers> = {
  type: 'input',
  name: 'schema',
  message: 'Point to schema:',
  suffix: chalk.grey(' (path or url)'),
  validate: (str: string) => str.length > 0
};

const askForDocuments: inquirer.Question<Answers>[] = [
  {
    type: 'confirm',
    name: 'hasDocuments',
    message: `Includes documents?`,
    suffix: chalk.grey(' hit enter for YES'),
    default: true,
    when: answers => answers.target === Tags.client
  },
  {
    type: 'input',
    name: 'documents',
    message: 'Where are documents?:',
    suffix: chalk.grey(' hit enter for **/*.graphql'),
    when: answers => answers.hasDocuments === true,
    default: '**/*.graphql',
    validate: (str: string) => str.length > 0
  }
];

const askForOutput: inquirer.Question<Answers> = {
  type: 'input',
  name: 'generate',
  message: 'Where to write the output (path):',
  validate: (str: string) => str.length > 0
};

export async function init() {
  log(`
    Welcome to ${chalk.bold('GraphQL Code Generator')}!
    Answer few questions and we will generate a config for you.
  `);

  const answers = await inquirer.prompt([
    askForTarget,
    askForPlugins,
    askForSchema,
    ...askForDocuments,
    askForOutput,
    askForFormat
  ]);

  const config: Types.Config = {
    overwrite: true,
    schema: answers.schema,
    documents: answers.documents,
    generates: {
      [answers.generate]: {
        plugins: answers.plugins
      }
    }
  };

  const ext = answers.format === 'JSON' ? 'json' : 'yml';
  const content = answers.format === 'JSON' ? JSON.stringify(config) : YAML.stringify(config);
  const fullpath = resolve(process.cwd(), `codegen.${ext}`);
  const relativepath = relative(process.cwd(), `codegen.${ext}`);

  writeFileSync(fullpath, content, {
    encoding: 'utf-8'
  });

  log(`
    Config file generated at ${chalk.bold(relativepath)}
    You can now add a script in package.json

    ${chalk.italic(`
      {
        "scripts": {
          ...
          "generate": "gql-gen"
        }
      }
    `)}
  `);
}
