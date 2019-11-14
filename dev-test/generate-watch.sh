#/bin/sh

DOTENV_CONFIG_PATH=$PWD/dev-test/.env node packages/graphql-codegen-cli/dist/bin.js --require dotenv/config --config ./dev-test/codegen.yml -w
