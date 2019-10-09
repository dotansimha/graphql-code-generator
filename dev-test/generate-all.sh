#/bin/sh

DOTENV_CONFIG_PATH=$PWD/dev-test/.env node --require dotenv/config packages/graphql-codegen-cli/dist/commonjs/bin.js --config ./dev-test/codegen.yml
