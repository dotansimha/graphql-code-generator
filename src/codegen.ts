import {GraphQLSchema} from 'graphql';
import {Codegen, Model, CodegenDocument} from './interfaces';
import {GraphQLNamedType, DefinitionNode, DocumentNode, Kind} from 'graphql';
import {handleType} from './model-handler';
import {handleOperation} from './operation-handler';
import {handleFragment} from './fragment-handler';

export const prepareCodegen = (schema: GraphQLSchema, document: DocumentNode): Codegen => {
  let models: Model[] = [];
  let documents: CodegenDocument[] = [];
  let typesMap: GraphQLNamedType = schema.getTypeMap();

  Object.keys(typesMap).forEach(typeName => {
    models.push(handleType(typeName, typesMap[typeName]));
  });

  document.definitions.forEach((definition: DefinitionNode) => {
    switch (definition.kind) {
      case Kind.OPERATION_DEFINITION:
        documents.push(handleOperation(schema, definition));
        break;

      case Kind.FRAGMENT_DEFINITION:
        documents.push(handleFragment(schema, definition));
        break;

      default:
        break;
    }
  });

  return <Codegen>{
    models: models.filter(item => item),
    documents: documents.filter(item => item)
  };
};
