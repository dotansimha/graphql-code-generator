import { CommandObject } from 'graphql-cli';
import { generate, CLIOptions } from 'graphql-code-generator';
import { initCLI } from 'graphql-code-generator/dist/codegen';

const command: CommandObject = {
  command: 'gql-gen',
  handler: (context, options: CLIOptions) => generate(options),
  builder: {
    verbose: {
      describe: 'Show verbose output messages',
      type: 'boolean',
      default: 'false'
    }
  }
};

module.exports = [command];
