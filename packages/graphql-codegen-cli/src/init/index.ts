import inquirer from 'inquirer';
import { Types } from '@graphql-codegen/plugin-helpers';
import { getQuestions } from './questions.js';
import { guessTargets } from './targets.js';
import { Answers, Tags } from './types.js';
import { writeConfig, writePackage, bold } from './helpers.js';

function log(...msgs: string[]) {
  // eslint-disable-next-line no-console
  console.log(...msgs);
}

export async function init() {
  log(`
    Welcome to ${bold('GraphQL Code Generator')}!
    Answer few questions and we will setup everything for you.
  `);

  const possibleTargets = await guessTargets();

  const answers = await inquirer.prompt<Answers>(getQuestions(possibleTargets));

  // define config
  const config: Types.Config = {
    overwrite: true,
    schema: answers.schema,
    documents: answers.targets.includes(Tags.browser) ? answers.documents : null,
    generates: {
      [answers.output]: {
        plugins: answers.plugins.map(p => p.value),
      },
    },
  };

  // introspection
  if (answers.introspection) {
    addIntrospection(config);
  }

  // config file
  const { relativePath } = await writeConfig(answers, config);

  log(`Fetching latest versions of selected plugins...`);

  // write package.json
  await writePackage(answers, relativePath);

  // Emit status to the terminal
  log(`
    Config file generated at ${bold(relativePath)}
    
      ${bold('$ npm install')}

    To install the plugins.

      ${bold(`$ npm run ${answers.script}`)}

    To run GraphQL Code Generator.
  `);
}

// adds an introspection to `generates`
function addIntrospection(config: Types.Config) {
  config.generates['./graphql.schema.json'] = {
    plugins: ['introspection'],
  };
}
