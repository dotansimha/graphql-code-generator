#!/usr/bin/env node

import {loadSchema} from './scheme-loader';
import {loadDocumentsSources} from './document-loader';
import {prepareCodegen} from './codegen';
import {generateCode} from './generator';

const schema = loadSchema('./dev-test/githunt/schema.json');
const documents = loadDocumentsSources([ './dev-test/githunt/comment.query.graphql' ]);
const codegen = prepareCodegen(schema, documents);
const generated = generateCode(codegen, './generators/typescript/graphql-types.d.ts.handlebars');

console.log(generated);
