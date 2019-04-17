const { generateConfig } = require('@graphql-codegen/config-markdown-generator');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

const BASE_DIR = '../docs/generated-config';

const mapping = {
  '../packages/plugins/other/time/src/index.ts': BASE_DIR + '/time.md',
  '../packages/plugins/typescript/typescript/src/index.ts': BASE_DIR + '/typescript.md',
  '../packages/plugins/typescript/compatibility/src/index.ts': BASE_DIR + '/typescript-compatibility.md',
  '../packages/plugins/typescript/operations/src/index.ts': BASE_DIR + '/typescript-operations.md',
  '../packages/plugins/typescript/mongodb/src/index.ts': BASE_DIR + '/typescript-mongodb.md',
  '../packages/plugins/typescript/resolvers/src/index.ts': BASE_DIR + '/typescript-resolvers.md',
  '../packages/plugins/typescript/apollo-angular/src/index.ts': BASE_DIR + '/typescript-apollo-angular.md',
  '../packages/plugins/typescript/react-apollo/src/index.ts': BASE_DIR + '/typescript-react-apollo.md',
  '../packages/plugins/typescript/stencil-apollo/src/index.ts': BASE_DIR + '/typescript-stencil-apollo.md',
  '../packages/plugins/java/resolvers/src/index.ts': BASE_DIR + '/java-resolvers.md',
  '../packages/plugins/java/java/src/index.ts': BASE_DIR + '/java.md',
  '../packages/plugins/flow/flow/src/index.ts': BASE_DIR + '/flow.md',
  '../packages/plugins/flow/resolvers/src/index.ts': BASE_DIR + '/flow-resolvers.md',
  '../packages/plugins/flow/operations/src/index.ts': BASE_DIR + '/flow-operations.md',
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
