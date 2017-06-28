import {GraphQLSchema} from 'graphql';
import {Codegen, Model, CodegenDocument} from '../models/interfaces';
import {GraphQLNamedType, DefinitionNode, DocumentNode, Kind} from 'graphql';
import {handleType} from '../handlers/model-handler';
import {handleOperation} from '../handlers/operation-handler';
import {handleFragment} from '../handlers/fragment-handler';

export interface CodegenConfig {
  flattenInnerTypes?: boolean;
  noSchema?: boolean;
  noDocuments?: boolean;
}

export const prepareCodegen = (schema: GraphQLSchema,
                               document: DocumentNode,
                               primitivesMap: any = {},
                               config: CodegenConfig = {}): Codegen => {
  let models: Model[] = [];
  let documents: CodegenDocument[] = [];
  let typesMap: { [typeName: string]: GraphQLNamedType } = schema.getTypeMap();

  Object.keys(typesMap).forEach(typeName => {
    if (!(typeName in primitivesMap)) {
      models.push(...handleType(schema, primitivesMap, typesMap[typeName]));
    }
  });

  if (!config.noDocuments) {
    document.definitions.forEach((definition: DefinitionNode) => {
      switch (definition.kind) {
        case Kind.OPERATION_DEFINITION:
          documents.push(handleOperation(schema, definition, primitivesMap, config.flattenInnerTypes));
          break;

        case Kind.FRAGMENT_DEFINITION:
          documents.push(handleFragment(schema, definition, primitivesMap, config.flattenInnerTypes));
          break;

        default:
          break;
      }
    });
  }


  return <Codegen>{
    models: models.filter(item => {
      if (item) {
        return !(config.noSchema && !item.isEnum);
      }

      return false;
    }),
    documents: documents.filter(item => item)
  };
};
