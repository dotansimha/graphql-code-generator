import { generate, CLIOptions } from 'graphql-code-generator';
import { Compiler } from 'webpack';

export class GraphQLCodegenPlugin {
  pluginName = 'GraphQLCodeGeneratorPlugin';

  constructor(private options: CLIOptions) {}

  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tapAsync(this.pluginName, () => this.run());
  }

  run() {
    // TODO: caching
    return generate(this.options, true);
  }
}
