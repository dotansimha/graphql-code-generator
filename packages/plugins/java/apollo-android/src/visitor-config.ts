import { ParsedConfig } from '@graphql-codegen/visitor-plugin-common';

export interface VisitorConfig extends ParsedConfig {
  package: string;
  typePackage: string;
  fragmentPackage: string;
}
