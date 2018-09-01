import typescriptConfig from 'graphql-codegen-typescript-template';

import * as components from './components.handlebars';
import { gql } from './helpers/gql';

typescriptConfig.templates['documents'] += components;
typescriptConfig.customHelpers.gql = gql;

export { typescriptConfig as config };
