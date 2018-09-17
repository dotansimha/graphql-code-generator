import typescriptConfig from 'graphql-codegen-typescript-template';

import * as components from './components.handlebars';
import { gql } from './helpers/gql';
import { generateFragments } from './helpers/generate-fragments';

typescriptConfig.templates['documents'] += components;
typescriptConfig.customHelpers.gql = gql;
typescriptConfig.customHelpers.generateFragments = generateFragments;

export { typescriptConfig as config };
