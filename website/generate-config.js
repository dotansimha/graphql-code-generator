const { generateConfig } = require('@graphql-codegen/config-markdown-generator');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

const BASE_DIR = './docs/generated-config';

const mapping = {
  // Presets
  '../packages/presets/near-operation-file/src/index.ts': BASE_DIR + '/near-operation-file.md',
  '../packages/presets/import-types/src/index.ts': BASE_DIR + '/import-types.md',
  // Plugins
  '../packages/plugins/c-sharp/c-sharp/src/config.ts': BASE_DIR + '/c-sharp.md',
  '../packages/plugins/c-sharp/c-sharp-operations/src/config.ts': BASE_DIR + '/c-sharp-operations.md',
  '../packages/plugins/other/schema-ast/src/index.ts': BASE_DIR + '/schema-ast.md',
  '../packages/plugins/other/time/src/index.ts': BASE_DIR + '/time.md',
  '../packages/plugins/typescript/graphql-files-modules/src/index.ts': BASE_DIR + '/graphql-files-modules.md',
  '../packages/plugins/typescript/named-operations-object/src/index.ts': BASE_DIR + '/named-operations-object.md',
  '../packages/plugins/typescript/graphql-request/src/config.ts': BASE_DIR + '/typescript-graphql-request.md',
  '../packages/plugins/typescript/typescript/src/config.ts': BASE_DIR + '/typescript.md',
  '../packages/plugins/typescript/compatibility/src/config.ts': BASE_DIR + '/typescript-compatibility.md',
  '../packages/plugins/typescript/operations/src/config.ts': BASE_DIR + '/typescript-operations.md',
  '../packages/plugins/typescript/mongodb/src/config.ts': BASE_DIR + '/typescript-mongodb.md',
  '../packages/plugins/typescript/resolvers/src/config.ts': BASE_DIR + '/typescript-resolvers.md',
  '../packages/plugins/typescript/apollo-angular/src/config.ts': BASE_DIR + '/typescript-apollo-angular.md',
  '../packages/plugins/typescript/urql/src/config.ts': BASE_DIR + '/typescript-urql.md',
  '../packages/plugins/typescript/react-apollo/src/config.ts': BASE_DIR + '/typescript-react-apollo.md',
  '../packages/plugins/typescript/vue-apollo/src/config.ts': BASE_DIR + '/typescript-vue-apollo.md',
  '../packages/plugins/typescript/stencil-apollo/src/config.ts': BASE_DIR + '/typescript-stencil-apollo.md',
  '../packages/plugins/typescript/document-nodes/src/index.ts': BASE_DIR + '/typescript-document-nodes.md',
  '../packages/plugins/java/apollo-android/src/plugin.ts': BASE_DIR + '/java-apollo-android.md',
  '../packages/plugins/java/resolvers/src/config.ts': BASE_DIR + '/java-resolvers.md',
  '../packages/plugins/java/java/src/config.ts': BASE_DIR + '/java.md',
  '../packages/plugins/java/kotlin/src/config.ts': BASE_DIR + '/kotlin.md',
  '../packages/plugins/flow/flow/src/config.ts': BASE_DIR + '/flow.md',
  '../packages/plugins/flow/resolvers/src/index.ts': BASE_DIR + '/flow-resolvers.md',
  '../packages/plugins/flow/operations/src/config.ts': BASE_DIR + '/flow-operations.md',
  '../packages/plugins/other/introspection/src/index.ts': BASE_DIR + '/introspection.md',
  '../packages/plugins/other/fragment-matcher/src/index.ts': BASE_DIR + '/fragment-matcher.md',
  '../packages/plugins/other/visitor-plugin-common/src/base-visitor.ts': BASE_DIR + '/base-visitor.md',
  '../packages/plugins/other/visitor-plugin-common/src/base-types-visitor.ts': BASE_DIR + '/base-types-visitor.md',
  '../packages/plugins/other/visitor-plugin-common/src/base-resolvers-visitor.ts': BASE_DIR + '/base-resolvers-visitor.md',
  '../packages/plugins/other/visitor-plugin-common/src/base-documents-visitor.ts': BASE_DIR + '/base-documents-visitor.md',
  '../packages/plugins/other/visitor-plugin-common/src/client-side-base-visitor.ts': BASE_DIR + '/client-side-base-visitor.md',
};

Promise.all(
  Object.keys(mapping).map(source => {
    return new Promise(async r => {
      console.log(`Build config markdown for ${source}...`);
      const absPathSource = resolve(process.cwd(), source);
      const outputPath = mapping[source];
      const absPathOut = resolve(process.cwd(), outputPath);
      const result = await generateConfig(absPathSource);
      writeFileSync(absPathOut, result);
      r();
    });
  })
).then(() => console.log('done'));
