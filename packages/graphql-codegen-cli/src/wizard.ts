import * as inquirer from 'inquirer';
import chalk from 'chalk';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
const detectIndent = require('detect-indent');

function log(...msgs: string[]) {
  // tslint:disable-next-line
  console.log(...msgs);
}

const templates = {
  regular: {
    name: 'Regular',
    value: 'graphql-codegen-typescript-template'
  },
  resolvers: {
    name: 'Resolvers',
    value: 'graphql-codegen-typescript-resolvers-template'
  },
  react: {
    name: 'React Apollo',
    value: 'graphql-codegen-typescript-react-apollo-template'
  },
  angular: {
    name: 'Apollo Angular',
    value: 'graphql-codegen-apollo-angular-template'
  },
  mongodb: {
    name: 'MongoDB',
    value: 'graphql-codegen-typescript-mongodb-template'
  },
  graphqlFiles: {
    name: 'GraphQL files',
    value: 'graphql-codegen-graphql-files-typescript-modules'
  },
  other: {
    name: 'Other template',
    value: 'other'
  }
};

const languages = {
  ts: {
    name: 'TypeScript',
    value: 'ts'
  },
  other: {
    name: 'Other',
    value: 'other'
  }
};

const askForLanguage: inquirer.Question = {
  type: 'list',
  name: 'language',
  message: 'Language?',
  choices: [languages.ts, languages.other]
};

const askForTemplate: inquirer.Question[] = [
  {
    type: 'list',
    name: 'template',
    message: 'Template?',
    choices: answers => {
      if (answers.language === languages.ts.value) {
        return [
          templates.regular,
          templates.resolvers,
          templates.react,
          templates.angular,
          templates.mongodb,
          templates.other
        ];
      }

      return [templates.graphqlFiles, templates.other];
    }
  },
  {
    type: 'input',
    name: 'template',
    message: 'Template:',
    when: answers => answers.template === templates.other.value,
    validate: (str: string) => str.length > 0
  }
];

const askForSchema: inquirer.Question = {
  type: 'input',
  name: 'schema',
  message: 'Point to schema:',
  suffix: chalk.grey(' (path or url)'),
  validate: (str: string) => str.length > 0
};

const askForDocuments: inquirer.Question[] = [
  {
    type: 'confirm',
    name: 'hasDocuments',
    message: `Includes documents?`,
    suffix: chalk.grey(' hit enter for YES'),
    default: true
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

const askForOutput: inquirer.Question = {
  type: 'input',
  name: 'output',
  message: 'Output:',
  validate: (str: string) => str.length > 0
};

const askForScriptName: inquirer.Question = {
  type: 'input',
  name: 'script',
  message: 'Script name:',
  suffix: chalk.grey(' (we will add it to package.json)'),
  validate: (str: string) => str.length > 0
};

const askConfirm: inquirer.Question = {
  type: 'confirm',
  name: 'write',
  message: `Is everything correct, should we add script to package.json?`
};

export async function init() {
  log(`

    Welcome to ${chalk.bold('GraphQL Code Generator')} wizard!

  `);

  const answers = await inquirer.prompt([
    askForLanguage,
    ...askForTemplate,
    askForSchema,
    ...askForDocuments,
    askForOutput,
    askForScriptName
  ]);

  const template: string = answers.customTemplate || answers.template;
  const schema: string = answers.schema;
  const documents: string = answers.hasDocuments ? answers.documents : null;
  const output: string = answers.output;
  const script: string = answers.script;

  log(`
    Template:     ${template}
    Schema:       ${schema}
    Documents:    ${documents ? documents : 'No'}
    Output:       ${output}
    Script:       ${script}
  `);

  const { write } = await inquirer.prompt(askConfirm);

  if (!write) {
    log(`

      Please, start again.

    `);
    return;
  }

  const options: string[] = [`gql-gen`, `--schema ${schema}`, `--template ${template}`, `--out ${output}`];

  if (documents) {
    options.push(documents);
  }

  const command = options.join(' ');

  const pkgPath = resolve(process.cwd(), 'package.json');
  const content = readFileSync(pkgPath, {
    encoding: 'utf-8'
  });
  const { amount } = detectIndent(content);
  const pkg: any = JSON.parse(content);

  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  if (pkg.scripts[script]) {
    throw new Error(`Script ${script} already exists and runs "${pkg.scripts[script]}"`);
  }

  pkg.scripts[script] = command;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, amount));

  // TODO: install selected template and graphql-code-generator

  log(`

    Script ${script} successfully added!

    You can now run:

      ${chalk.bold('$ yarn ' + script)}

      Or
      
      ${chalk.bold('$ npm run ' + script)}

  `);
}
