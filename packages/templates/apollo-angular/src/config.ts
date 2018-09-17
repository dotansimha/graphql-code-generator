import typescriptConfig from 'graphql-codegen-typescript-template';

import * as components from './components.handlebars';
import { gql } from './helpers/gql';
import { generateFragment } from './helpers/generate-fragment';
import { importNgModules } from './helpers/import-ng-modules';
import { providedIn } from './helpers/provided-in';

typescriptConfig.templates['documents'] += components;
typescriptConfig.customHelpers.gql = gql;
typescriptConfig.customHelpers.generateFragment = generateFragment;
typescriptConfig.customHelpers.importNgModules = importNgModules;
typescriptConfig.customHelpers.providedIn = providedIn;

export { typescriptConfig as config };
