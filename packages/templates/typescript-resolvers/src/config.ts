import typescriptConfig from 'graphql-codegen-typescript-template';

import * as resolver from './resolver.handlebars';
import * as beforeSchema from './before-schema.handlebars';
import * as afterSchema from './after-schema.handlebars';

typescriptConfig.templates['resolver'] = resolver;
typescriptConfig.templates['schema'] = `${beforeSchema}${typescriptConfig.templates['schema']}${afterSchema}`;
typescriptConfig.outFile = 'resolvers-types.ts';

export { typescriptConfig as config };
