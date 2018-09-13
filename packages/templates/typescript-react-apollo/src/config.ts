import typescriptConfig from 'graphql-codegen-typescript-template';

import * as components from './components.handlebars';
import { gql } from './helpers/gql';
import { generateFragment } from './helpers/generate-fragment';
import { eq } from './helpers/eq';
import { toLowerCase } from './helpers/to-lower-case';

typescriptConfig.templates['documents'] += components;
typescriptConfig.customHelpers.gql = gql;
typescriptConfig.customHelpers.generateFragment = generateFragment;
typescriptConfig.customHelpers.eq = eq;
typescriptConfig.customHelpers.toLowerCase = toLowerCase;

export { typescriptConfig as config };
