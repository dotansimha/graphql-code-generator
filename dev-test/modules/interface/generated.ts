import * as Types from '../types.js';
import * as gm from 'graphql-modules';
export namespace InterfaceModule {
  interface DefinedFields {
    Flower: 'id' | 'species' | 'age' | 'color';
    Tree: 'id' | 'species' | 'age' | 'height';
    Plant: 'id' | 'species' | 'age';
  }

  export type Plant = Pick<Types.Plant, DefinedFields['Plant']>;
  export type Flower = Pick<Types.Flower, DefinedFields['Flower']>;
  export type Tree = Pick<Types.Tree, DefinedFields['Tree']>;

  export type FlowerResolvers = Pick<Types.FlowerResolvers, DefinedFields['Flower'] | '__isTypeOf'>;
  export type TreeResolvers = Pick<Types.TreeResolvers, DefinedFields['Tree'] | '__isTypeOf'>;
  export type PlantResolvers = Pick<Types.PlantResolvers, DefinedFields['Plant']>;

  export interface Resolvers {
    Flower?: FlowerResolvers;
    Tree?: TreeResolvers;
  }

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Flower?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      species?: gm.Middleware[];
      age?: gm.Middleware[];
      color?: gm.Middleware[];
    };
    Tree?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      species?: gm.Middleware[];
      age?: gm.Middleware[];
      height?: gm.Middleware[];
    };
  }
}
