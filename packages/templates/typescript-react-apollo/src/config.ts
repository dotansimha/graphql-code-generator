import typescriptConfig from 'graphql-codegen-typescript-template';

import * as components from './components.handlebars';
import * as hoc from './hoc.handlebars';
import { gql } from './helpers/gql';
import { eq } from './helpers/eq';

typescriptConfig.templates['documents'] += components;
typescriptConfig.templates['documents'] += hoc;
typescriptConfig.customHelpers.gql = gql;
typescriptConfig.customHelpers.eq = eq;

export { typescriptConfig as config };
