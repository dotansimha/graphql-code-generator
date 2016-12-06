#!/usr/bin/env node

import {loadSchema} from './scheme-loader';
import {loadDocumentsSources} from './document-loader';
import {prepareCodegen} from './codegen';

const schema = loadSchema('./dev-test/githunt/schema.json');
const documents = loadDocumentsSources([ './dev-test/githunt/comment.query.graphql' ]);

const codegen = prepareCodegen(schema, documents);

