import { checkbox, input, select, confirm } from '@inquirer/prompts';
import { grey } from './helpers.js';
import { plugins } from './plugins.js';
import { type Answers, type PluginOption, Tags } from './types.js';

export async function getAnswers(possibleTargets: Record<Tags, boolean>): Promise<Answers> {
  try {
    const targetChoices = getApplicationTypeChoices(possibleTargets);

    const targets = await select({
      message: `What type of application are you building?`,
      choices: targetChoices,
      default: targetChoices.find(c => c.checked)?.value,
    });
    const schema = await input({
      message: `Where is your schema?: ${grey('(path or url)')}`,
      default: 'http://localhost:4000', // matches Apollo Server's default
      validate: str => str.length > 0,
    });

    let documents: string | undefined;
    if (targets.includes(Tags.client) || targets.includes(Tags.angular) || targets.includes(Tags.stencil))
      documents = await input({
        message: 'Where are your operations and fragments?:',
        default: getDocumentsDefaultValue(targets),
        validate: str => str.length > 0,
      });

    let plugins: PluginOption[];
    if (!targets.includes(Tags.client)) {
      plugins = await checkbox({
        message: 'Pick plugins:',
        choices: getPluginChoices(targets),
        validate: plugins => plugins.length > 0,
      });
    }

    const output = await input({
      message: 'Where to write the output:',
      default: getOutputDefaultValue({ targets, plugins }),
      validate: str => str.length > 0,
    });

    const introspection = await confirm({
      message: 'Do you want to generate an introspection file?',
      default: false,
    });

    const config = await input({
      message: 'How to name the config file?',
      default: (() =>
        targets.includes(Tags.client) || targets.includes(Tags.typescript) || targets.includes(Tags.angular)
          ? 'codegen.ts'
          : 'codegen.yml')(),
      validate: str => {
        const isNotEmpty = str.length > 0;
        const hasCorrectExtension = ['json', 'yml', 'yaml', 'js', 'ts'].some(ext =>
          str.toLocaleLowerCase().endsWith(`.${ext}`)
        );

        return isNotEmpty && hasCorrectExtension;
      },
    });

    const script = await input({
      default: 'codegen',
      message: 'What script in package.json should run the codegen?',
      validate: (str: string) => str.length > 0,
    });

    return {
      targets,
      schema,
      documents,
      plugins,
      output,
      introspection,
      config,
      script,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      // This error because user exited using CMD+C, just exit gracefully or else user would see an ugly error message
      // https://github.com/SBoudrias/Inquirer.js/blob/ee16061a1e3f99a6cc714a3d473f7cd12b06a3f1/packages/prompts/README.md#handling-ctrlc-gracefully
      process.exit();
    } else {
      throw error;
    }
  }
}

export function getApplicationTypeChoices(possibleTargets: Record<Tags, boolean>) {
  function withFlowOrTypescript(tags: Tags[]) {
    if (possibleTargets.TypeScript) {
      tags.push(Tags.typescript);
    } else if (possibleTargets.Flow) {
      tags.push(Tags.flow);
    } else if (possibleTargets.Node) {
      tags.push(Tags.typescript, Tags.flow);
    }
    return tags;
  }

  return [
    {
      name: 'Backend - API or server',
      key: 'backend',
      value: withFlowOrTypescript([Tags.node]),
      checked: possibleTargets.Node,
    },
    {
      name: 'Application built with Angular',
      key: 'angular',
      value: [Tags.angular],
      checked: possibleTargets.Angular,
    },
    {
      name: 'Application built with React',
      key: 'react',
      value: withFlowOrTypescript([Tags.react, Tags.client]),
      checked: possibleTargets.React,
    },
    {
      name: 'Application built with Stencil',
      key: 'stencil',
      value: [Tags.stencil, Tags.typescript],
      checked: possibleTargets.Stencil,
    },
    {
      name: 'Application built with Vue',
      key: 'vue',
      value: [Tags.vue, Tags.client],
      checked: possibleTargets.Vue,
    },
    {
      name: 'Application using graphql-request',
      key: 'graphqlRequest',
      value: [Tags.graphqlRequest, Tags.client],
      checked: possibleTargets.graphqlRequest,
    },
    {
      name: 'Application built with other framework or vanilla JS',
      key: 'client',
      value: [Tags.typescript, Tags.flow],
      checked:
        possibleTargets.Browser && !possibleTargets.Angular && !possibleTargets.React && !possibleTargets.Stencil,
    },
  ];
}

export function getPluginChoices(targets: Tags[]) {
  return plugins
    .filter(p => p.available(targets))
    .map(p => {
      return {
        name: p.name,
        value: p,
        checked: p.shouldBeSelected(targets),
      };
    });
}

function getOutputDefaultValue({ targets, plugins }: { targets: Tags[]; plugins: PluginOption[] }) {
  if (targets.includes(Tags.client)) {
    return 'src/gql/';
  }
  if (plugins.some(plugin => plugin.defaultExtension === '.tsx')) {
    return 'src/generated/graphql.tsx';
  }
  if (plugins.some(plugin => plugin.defaultExtension === '.ts')) {
    return 'src/generated/graphql.ts';
  }
  return 'src/generated/graphql.js';
}

function getDocumentsDefaultValue(targets: Tags[]): string {
  if (targets.includes(Tags.vue)) {
    return 'src/**/*.vue';
  }
  if (targets.includes(Tags.angular)) {
    return 'src/**/*.ts';
  }
  if (targets.includes(Tags.client)) {
    return 'src/**/*.tsx';
  }
  return 'src/**/*.graphql';
}
