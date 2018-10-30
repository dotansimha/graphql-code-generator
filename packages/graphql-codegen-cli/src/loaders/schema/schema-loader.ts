import { GraphQLSchema } from 'graphql';
import { Types } from 'graphql-codegen-core';

export interface SchemaLoader<T = any> {
  canHandle(pointerToSchema: string): Promise<boolean> | boolean;
  handle(pointerToSchema: string, config: Types.Config, schemaOptions: T): Promise<GraphQLSchema> | GraphQLSchema;
}
