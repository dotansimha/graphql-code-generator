'use strict';

const fs = require('fs');
const path = require('path');

const sdkBasePath = path.resolve(__dirname, '..', 'src', 'sdk-base.ts');
const sdkOutPath = path.resolve(__dirname, '..', 'src', 'sdk-static.ts');

const sdkBaseContents = fs.readFileSync(sdkBasePath, 'utf-8');

const escape = str => str.replace(/`/g, `\``);

const [imports, body] = sdkBaseContents.split('// IMPORTS END');

if (body === undefined) {
  throw new Error(`Missing '// IMPORTS END' that splits the body from the head within '${sdkBasePath}'.`);
}

fs.writeFileSync(
  sdkOutPath,
  `
export const importsString = ${JSON.stringify(imports)};
export const contentsString = ${JSON.stringify(body)};
`
);
