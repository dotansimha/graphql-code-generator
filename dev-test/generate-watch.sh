#/bin/sh

DOTENV_CONFIG_PATH=$PWD/dev-test/.env node --require dotenv/config packages/graphql-codegen-cli/dist/commonjs/bin.js dotenv_config_path=./dev-test/.env --config ./dev-test/codegen.yml -w
