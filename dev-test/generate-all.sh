#/bin/sh

node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-resolvers-template --schema ./dev-test/test-schema/schema.json --out ./dev-test/test-schema/resolvers-types.ts
node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-resolvers-template --schema ./dev-test/test-schema/schema-with-root.graphql --out ./dev-test/test-schema/resolvers-root.ts

node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/test-schema/schema.json --out ./dev-test/test-schema/typings.ts
CODEGEN_AVOID_OPTIONALS=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/test-schema/schema.json --out ./dev-test/test-schema/typings.avoidOptionals.ts
CODEGEN_IMMUTABLE_TYPES=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/test-schema/schema.json --out ./dev-test/test-schema/typings.immutableTypes.ts

node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-graphql-files-typescript-modules --schema ./dev-test/githunt/schema.json --out ./dev-test/githunt/graphql-declared-modules.d.ts "./dev-test/githunt/**/*.graphql"

node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/githunt/schema.json --out ./dev-test/githunt/types.ts "./dev-test/githunt/**/*.graphql"
CODEGEN_ENUMS_AS_TYPES=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/githunt/schema.json --out ./dev-test/githunt/types.d.ts "./dev-test/githunt/**/*.graphql"
CODEGEN_AVOID_OPTIONALS=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/githunt/schema.json --out ./dev-test/githunt/types.avoidOptionals.ts "./dev-test/githunt/**/*.graphql"
CODEGEN_IMMUTABLE_TYPES=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/githunt/schema.json --out ./dev-test/githunt/types.immutableTypes.ts "./dev-test/githunt/**/*.graphql"
CODEGEN_NO_NAMESPACES=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/githunt/schema.json --out ./dev-test/githunt/types.noNamespaces.ts "./dev-test/githunt/**/*.graphql"
node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-react-apollo-template --schema ./dev-test/githunt/schema.json --out ./dev-test/githunt/types.reactApollo.tsx "./dev-test/githunt/**/*.graphql"
CODEGEN_NO_NAMESPACES=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-react-apollo-template --schema ./dev-test/githunt/schema.json --out ./dev-test/githunt/types.reactApollo.noNamespaces.tsx "./dev-test/githunt/**/*.graphql"
node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template-multiple --schema ./dev-test/githunt/schema.json --out ./dev-test/githunt/ts-multiple/ "./dev-test/githunt/**/*.graphql"

node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/star-wars/schema.json --out ./dev-test/star-wars/types.ts "./dev-test/star-wars/**/*.graphql"
CODEGEN_ENUMS_AS_TYPES=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/star-wars/schema.json --out ./dev-test/star-wars/types.d.ts "./dev-test/star-wars/**/*.graphql"
CODEGEN_AVOID_OPTIONALS=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/star-wars/schema.json --out ./dev-test/star-wars/types.avoidOptionals.ts "./dev-test/star-wars/**/*.graphql"
CODEGEN_IMMUTABLE_TYPES=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/star-wars/schema.json --out ./dev-test/star-wars/types.immutableTypes.ts "./dev-test/star-wars/**/*.graphql"
CODEGEN_NO_NAMESPACES=true node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --schema ./dev-test/star-wars/schema.json --out ./dev-test/star-wars/types.noNamespaces.ts "./dev-test/star-wars/**/*.graphql"
node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template --skip-schema --schema ./dev-test/star-wars/schema.json --out ./dev-test/star-wars/types.skipSchema.ts "./dev-test/star-wars/**/*.graphql"
node packages/graphql-codegen-cli/dist/cli.js --template graphql-codegen-typescript-template-multiple --schema ./dev-test/star-wars/schema.json --out ./dev-test/star-wars/ts-multiple/ "./dev-test/star-wars/**/*.graphql"


