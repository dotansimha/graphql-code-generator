import typescriptConfig from 'graphql-codegen-typescript-template';

import * as components from './components.handlebars';
import { gql } from './helpers/gql';
import { generateFragment } from './helpers/generate-fragment';

typescriptConfig.templates['documents'] += components;
typescriptConfig.customHelpers.gql = gql;
typescriptConfig.customHelpers.generateFragment = generateFragment;

export { typescriptConfig as config };
