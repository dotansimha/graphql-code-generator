import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  indentMultiline,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLSchema, OperationDefinitionNode, print } from 'graphql';

import { Config, Info } from './index.js';
import { getFlagConfigForVariableDefinition, omitOclifDirectives } from './utils.js';

interface Operation {
  node: OperationDefinitionNode;
  documentVariableName: string;
  operationType: string;
  operationResultType: string;
  operationVariablesTypes: string;
}

interface OclifDirectiveValues {
  description?: string;
  examples?: string[];
}

export class GraphQLRequestVisitor extends ClientSideBaseVisitor<Config, ClientSideBasePluginConfig> {
  private _operationsToInclude: Operation[] = [];
  private _info: Info;

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: Config, info: Info) {
    super(schema, fragments, rawConfig, {});
    this._info = info;

    const { handlerPath = '../../handler' } = rawConfig;

    // FIXME: This is taken in part from
    //  presets/near-operation-file/src/index.ts:139. How do I build a path relative to the outputFile in the same way?
    //  A plugin doesn't appear to have access to the same "options.baseOutputDir" that the preset does.
    // const absClientPath = resolve(info.outputFile, join(options.baseOutputDir, options.presetConfig.baseTypesPath));

    autoBind(this);
    this._additionalImports.push(`import { Command, flags } from '@oclif/command'`);
    this._additionalImports.push(`import handler from '${handlerPath}'`);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
    });

    return null;
  }

  // Clean client-side content (ie directives) out of the GraphQL document prior to sending to the server
  public get definition(): string {
    const operation = this._operationsToInclude[0];
    const clientOperation = print(omitOclifDirectives(operation.node));
    return `const ${operation.documentVariableName} = \`\n${clientOperation}\``;
  }

  // Generate the code required for this CLI operation
  public get cliContent(): string {
    if (this._operationsToInclude.length !== 1) {
      throw new Error(
        `Each graphql document should have exactly one operation; found ${this._operationsToInclude.length} while generating ${this._info.outputFile}.`
      );
    }

    const operation = this._operationsToInclude[0];

    // Find the @oclif directive in the client document, if it's there
    const directive = operation.node.directives.find(directive => directive.name.value === 'oclif');

    // Remap the directive's fields ie @oclif(description: "a name") to a more usable format
    const directiveValues: OclifDirectiveValues = {};

    if (directive) {
      directiveValues.examples = [];
      directive.arguments.forEach(arg => {
        const value = 'value' in arg.value ? arg.value.value.toString() : null;
        const { value: name } = arg.name;
        if (name === 'description') {
          directiveValues.description = value;
        } else if (name === 'example') {
          directiveValues.examples.push(value);
        } else {
          throw new Error(`Invalid field supplied to @oclif directive: ${name}`);
        }
      });
    }

    const { description, examples } = directiveValues;

    const flags = operation.node.variableDefinitions.map(getFlagConfigForVariableDefinition);

    return `
${this.definition}

export default class ${operation.node.name.value} extends Command {
  ${description ? `\nstatic description = "${description}";\n` : ''}
  ${examples ? `\nstatic examples: string[] = ${JSON.stringify(examples)};\n` : ''}
  static flags = {
    help: flags.help({ char: 'h' }),
${indentMultiline(flags.join(',\n'), 2)}
  };

  async run() {
    const { flags } = this.parse(${operation.node.name.value});
    await handler({ command: this, query: ${operation.documentVariableName}, variables: flags });
  }
}
`;
  }
}
