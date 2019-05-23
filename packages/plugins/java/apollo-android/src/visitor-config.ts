import { ParsedConfig } from '@graphql-codegen/visitor-plugin-common';

export interface VisitorConfig extends ParsedConfig {
  package: string;
  inputPackage: string;
  fragmentPackage: string;
}
