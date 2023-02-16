import { defineCommand } from '@graphql-cli/common';
import {
  buildOptions,
  CodegenContext,
  CodegenExtension,
  generate,
  updateContextWithCliFlags,
  YamlCliFlags,
} from '@graphql-codegen/cli';

export default defineCommand<{}, YamlCliFlags>(api => {
  return {
    command: 'codegen',
    builder(yargs) {
      return yargs.options(buildOptions() as any) as any;
    },
    async handler(args) {
      const config = await api.useConfig({
        rootDir: args.config || process.cwd(),
        extensions: [CodegenExtension],
      });

      // Create Codegen Context with our loaded GraphQL Config
      const codegenContext = new CodegenContext({
        graphqlConfig: config,
      });
      // This will update Codegen Context with the options provided in CLI arguments
      updateContextWithCliFlags(codegenContext, args);

      await generate(codegenContext);
    },
  };
});
