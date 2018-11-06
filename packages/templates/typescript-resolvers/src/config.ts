import typescriptConfig from 'graphql-codegen-typescript-template';

import * as resolver from './resolver.handlebars';
import * as beforeSchema from './before-schema.handlebars';
import * as afterSchema from './after-schema.handlebars';
import { getParentType } from './helpers/parent-type';
import { getFieldType } from './helpers/field-type';
import { importMappers } from './helpers/import-mappers';
import { getFieldResolver } from './helpers/get-field-resolver';
import { getFieldResolverName } from './helpers/get-field-resolver-name';

typescriptConfig.templates['resolver'] = resolver;
typescriptConfig.templates['schema'] = `${beforeSchema}${typescriptConfig.templates['schema']}${afterSchema}`;
typescriptConfig.customHelpers.getParentType = getParentType;
typescriptConfig.customHelpers.getFieldType = getFieldType;
typescriptConfig.customHelpers.importMappers = importMappers;
typescriptConfig.customHelpers.getFieldResolver = getFieldResolver;
typescriptConfig.customHelpers.getFieldResolverName = getFieldResolverName;
// KAMIL: why? Do we have a default now?
typescriptConfig.outFile = 'resolvers-types.ts';

export { typescriptConfig as config };
