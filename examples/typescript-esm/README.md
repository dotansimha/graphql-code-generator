# GraphQL Code Generator usage with TypeScript and ESM

## Usage

```
# generate code
yarn codegen
# run tsc
yarn build
# run the tsc output
yarn start
```

## Explanation

In ESM the file extension must be appended to named imports.
This can be achieved by setting the codegen config `importExtension` to `'.js'` or `'.ts'` (see `codegen.yml`).

TypeScript introduced a new module resolution algorithm for ESM in version 4.7. We set the `moduleResolution` to `node16` and the (output) module type to `node16` (see `tsconfig.json`).
Additionally, within the `package.json` we specify the `type` property with the value `module` in order to instruct Node.js, bundlers and other tools that all `.js` files within this folder should be treated as ESM modules.

## Useful resources

- [ECMAScript Module Support in Node.js - TypeScript 4.7 Changelog](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)
- [package.json type module - Node.js documentation](https://nodejs.org/api/packages.html#type)
- [Named Imports - import MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#named_import)
