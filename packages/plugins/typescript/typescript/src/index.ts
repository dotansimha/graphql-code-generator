import {
  DefinitionNode,
  getNamedType,
  GraphQLNamedType,
  GraphQLSchema,
  isIntrospectionType,
  isObjectType,
  Kind,
  parse,
  printIntrospectionSchema,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { TypeScriptPluginConfig } from './config.js';
import { TsIntrospectionVisitor } from './introspection-visitor.js';
import { TsVisitor } from './visitor.js';

export * from './config.js';
export * from './introspection-visitor.js';
export * from './typescript-variables-to-object.js';
export * from './visitor.js';

function sortByInheritance(definitions: ReadonlyArray<DefinitionNode>): DefinitionNode[] {
  const defMap = new Map<string, DefinitionNode>();
  for (const def of definitions) {
    if ('name' in def && def.name?.value) {
      defMap.set(def.name.value, def);
    }
  }

  const visited = new Set<DefinitionNode>();
  const visiting = new Set<DefinitionNode>();
  const sorted: DefinitionNode[] = [];

  function visitNode(def: DefinitionNode): void {
    if (visited.has(def)) return;
    if (visiting.has(def)) return;

    visiting.add(def);

    if (
      (def.kind === Kind.OBJECT_TYPE_DEFINITION || def.kind === Kind.INTERFACE_TYPE_DEFINITION) &&
      def.interfaces
    ) {
      for (const iface of def.interfaces) {
        const dep = defMap.get(iface.name.value);
        if (dep) {
          visitNode(dep);
        }
      }
    }

    visiting.delete(def);
    visited.add(def);
    sorted.push(def);
  }

  for (const def of definitions) {
    visitNode(def);
  }

  return sorted;
}

export const plugin: PluginFunction<TypeScriptPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptPluginConfig,
) => {
  const { schema: _schema, ast } = transformSchemaAST(schema, config);

  const visitor = new TsVisitor(_schema, config);

  const sortedAst = {
    ...ast,
    definitions: sortByInheritance(ast.definitions),
  };

  const visitorResult = oldVisit(sortedAst, { leave: visitor });
  const introspectionDefinitions = includeIntrospectionTypesDefinitions(_schema, documents, config);
  const scalars = visitor.scalarsDefinition;
  const directiveArgumentAndInputFieldMappings =
    visitor.directiveArgumentAndInputFieldMappingsDefinition;

  return {
    prepend: [
      ...visitor.getEnumsImports(),
      ...visitor.getDirectiveArgumentAndInputFieldMappingsImports(),
      ...visitor.getScalarsImports(),
      ...visitor.getWrapperDefinitions(),
    ].filter(Boolean),
    content: [
      scalars,
      directiveArgumentAndInputFieldMappings,
      ...visitorResult.definitions,
      ...introspectionDefinitions,
    ]
      .filter(Boolean)
      .join('\n'),
  };
};

export function includeIntrospectionTypesDefinitions(
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptPluginConfig,
): string[] {
  const typeInfo = new TypeInfo(schema);
  const usedTypes: GraphQLNamedType[] = [];
  const documentsVisitor = visitWithTypeInfo(typeInfo, {
    Field() {
      const fieldType = typeInfo.getType();
      const type = fieldType ? getNamedType(fieldType) : undefined;

      if (type && isIntrospectionType(type) && !usedTypes.includes(type)) {
        usedTypes.push(type);
      }
    },
  });

  for (const doc of documents) {
    if (!doc.document) {
      continue;
    }
    visit(doc.document, documentsVisitor);
  }

  const typesToInclude: GraphQLNamedType[] = [];

  for (const type of usedTypes) {
    collectTypes(type);
  }

  const visitor = new TsIntrospectionVisitor(schema, config, typesToInclude);
  const result = oldVisit(parse(printIntrospectionSchema(schema)), {
    leave: visitor,
  });

  // recursively go through each `usedTypes` and their children and collect all used types
  // we don't care about Interfaces, Unions and others, but Objects and Enums
  function collectTypes(type: GraphQLNamedType): void {
    if (typesToInclude.includes(type)) {
      return;
    }

    typesToInclude.push(type);

    if (isObjectType(type)) {
      const fields = type.getFields();

      for (const key of Object.keys(fields)) {
        const field = fields[key];
        const type = getNamedType(field.type);
        collectTypes(type);
      }
    }
  }

  // FIXME(strict=true) this is the existing logic, casting to avoid runtime differences
  return result.definitions as string[];
}
