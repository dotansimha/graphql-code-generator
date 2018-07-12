import { GraphQLSchema } from 'graphql';

export interface SchemaLoader {
  canHandle(pointerToSchema: string): Promise<boolean> | boolean;
  handle(pointerToSchema: string): Promise<GraphQLSchema> | GraphQLSchema;
}
