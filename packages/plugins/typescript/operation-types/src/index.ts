import { getCachedDocumentNodeFromSchema, oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import {
  ASTVisitor,
  getNamedType,
  GraphQLNamedType,
  GraphQLSchema,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isUnionType,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import { SpecificTypesVisitor } from './visitor';
import { TypescriptOperationTypesPluginConfig } from './config';

export { TypescriptOperationTypesPluginConfig } from './config';

export const plugin: PluginFunction<TypescriptOperationTypesPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypescriptOperationTypesPluginConfig
) => {
  const ast = getCachedDocumentNodeFromSchema(schema);

  const discoveredTypes = discoverTypes(documents, schema, config.omitObjectTypes ?? false);

  const visitor = new SpecificTypesVisitor(schema, config, discoveredTypes);

  // This is generally the same as the typescript plugin, just with only the types discovered in the operations
  const visitorResult = oldVisit(ast, { leave: visitor });
  const scalars = visitor.scalarsDefinition;
  const directiveArgumentAndInputFieldMappings = visitor.directiveArgumentAndInputFieldMappingsDefinition;

  return {
    prepend: [
      ...visitor.getEnumsImports(),
      ...visitor.getDirectiveArgumentAndInputFieldMappingsImports(),
      ...visitor.getScalarsImports(),
      ...visitor.getWrapperDefinitions(),
    ].filter(Boolean),
    content: [scalars, directiveArgumentAndInputFieldMappings, ...visitorResult.definitions].filter(Boolean).join('\n'),
  };
};

/**
 * Navigates through a named node and collects all enum, input, and object types in the node tree.
 * @param node
 * @param discoveredTypes the discovered types names, a map is used for performant checking instead of an array as
 *        the list could become large for large sub graphs
 */
function collectTypesFromNode(node: GraphQLNamedType, discoveredTypes: Map<string, boolean>) {
  const name = node.name;

  if (isInputObjectType(node)) {
    if (discoveredTypes.has(name)) {
      return;
    }
    discoveredTypes.set(name, true);

    const fields = node.getFields();

    Object.keys(fields).forEach(key => {
      const field = fields[key];
      const type = getNamedType(field.type);
      collectTypesFromNode(type, discoveredTypes);
    });
    return;
  }

  if (isObjectType(node) || isInterfaceType(node)) {
    if (discoveredTypes.has(name)) {
      return;
    }
    discoveredTypes.set(name, true);

    const fields = node.getFields();

    Object.keys(fields).forEach(key => {
      const field = fields[key];
      const type = getNamedType(field.type);
      collectTypesFromNode(type, discoveredTypes);
    });

    const interfaces = node.getInterfaces();

    for (const interfaceType of interfaces) {
      collectTypesFromNode(interfaceType, discoveredTypes);
    }

    return;
  }

  if (isUnionType(node)) {
    if (discoveredTypes.has(name)) {
      return;
    }

    discoveredTypes.set(name, true);

    const unionTypes = node.getTypes();
    for (const type of unionTypes) {
      collectTypesFromNode(type, discoveredTypes);
    }
  }

  if (isEnumType(node)) {
    if (!discoveredTypes.has(node.name)) {
      discoveredTypes.set(node.name, true);
    }
    return;
  }
}

function discoverTypes(
  documents: Types.DocumentFile[],
  schema: GraphQLSchema,
  omitModelTypes: boolean
): Map<string, boolean> {
  const discoveredTypes = new Map<string, boolean>();

  // Visitor
  const typeInfo = new TypeInfo(schema);
  const documentVisitor: ASTVisitor = visitWithTypeInfo(typeInfo, {
    Field: () => {
      const type = getNamedType(typeInfo.getType());
      if (type != null) {
        // Collect fragment enum field types (always required even if fragments are pre resolved)
        if (isEnumType(type)) {
          discoveredTypes.set(type.name, true);
        }

        // Collect fragment field object types to be used if omitModelTypes is false
        if (isObjectType(type) && !omitModelTypes) {
          collectTypesFromNode(type, discoveredTypes);
        }
      }
    },
    FragmentDefinition: () => {
      // Collect fragment object types to be used if omitModelTypes is false
      const type = getNamedType(typeInfo.getType());
      if (type != null && isObjectType(type) && !omitModelTypes) {
        collectTypesFromNode(type, discoveredTypes);
      }
    },

    InlineFragment: () => {
      const type = getNamedType(typeInfo.getType());
      if (isObjectType(type) && !omitModelTypes) {
        collectTypesFromNode(type, discoveredTypes);
      }
    },

    VariableDefinition: () => {
      /*
       Record the input types in the variables, this is the starting point of what input types
       will be included, but we also need to iterate through the fields in the input types
       in order to get all the enums and input types that exist in this input type
      */
      const inputType = getNamedType(typeInfo.getInputType());
      if (inputType && isInputObjectType(inputType)) {
        collectTypesFromNode(inputType, discoveredTypes);
      }
    },
  });

  for (const document of documents) {
    if (document.document) {
      visit(document.document, documentVisitor);
    }
  }

  return discoveredTypes;
}
