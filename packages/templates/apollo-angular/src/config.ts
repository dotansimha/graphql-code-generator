import typescriptConfig from 'graphql-codegen-typescript-template';

import * as components from './components.handlebars';
import { gql } from './helpers/gql';
import { generateFragment } from './helpers/generate-fragment';
import { providedIn } from './helpers/provided-in';

typescriptConfig.templates['documents'] += components;
typescriptConfig.customHelpers.gql = gql;
typescriptConfig.customHelpers.generateFragment = generateFragment;
typescriptConfig.customHelpers.providedIn = providedIn;

export { typescriptConfig as config };
