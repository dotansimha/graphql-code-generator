import typescriptConfig from 'graphql-codegen-typescript-template';

import * as components from './components.handlebars';
import { gql as gqlHelper } from './helpers/gql';
import gql from 'graphql-tag';
import { generateFragments } from './helpers/generate-fragments';
import { importNgModules } from './helpers/import-ng-modules';
import { providedIn } from './helpers/provided-in';

typescriptConfig.templates['documents'] += components;
typescriptConfig.customHelpers.gql = gqlHelper;
typescriptConfig.customHelpers.generateFragments = generateFragments;
typescriptConfig.customHelpers.importNgModules = importNgModules;
typescriptConfig.customHelpers.providedIn = providedIn;
typescriptConfig.addToSchema = gql`
  directive @NgModule(module: String!) on OBJECT
`;

export { typescriptConfig as config };
