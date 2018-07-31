import typescriptConfig from 'graphql-codegen-typescript-template';

import * as components from './components.handlebars';

typescriptConfig.templates['documents'] += components;

export { typescriptConfig as config };
