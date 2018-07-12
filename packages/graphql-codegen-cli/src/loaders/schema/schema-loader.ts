import { GraphQLSchema } from 'graphql';
import { CLIOptions } from '../../cli-options';

export interface SchemaLoader {
  canHandle(pointerToSchema: string): Promise<boolean> | boolean;
  handle(pointerToSchema: string, cliOptions: CLIOptions): Promise<GraphQLSchema> | GraphQLSchema;
}
