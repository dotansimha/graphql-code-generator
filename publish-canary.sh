#!/bin/bash

echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > .npmrc
npm whoami

npm run release:canary
