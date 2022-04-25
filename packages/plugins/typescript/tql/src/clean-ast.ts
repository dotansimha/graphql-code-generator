import { ASTNode } from 'graphql';

type NotReadonly<T> = {
  -readonly [P in keyof T]: T[P];
};

export const cleanup = <T extends ASTNode>(node: T) => {
  const n = node as NotReadonly<ASTNode>;
  if (n.kind === 'Document') {
    n.definitions = n.definitions.map(cleanup);
  }

  if (n.kind === 'OperationDefinition') {
    if (!n.name) delete n.name;
    if (!n.variableDefinitions) delete n.variableDefinitions;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'VariableDefinition') {
    if (!n.defaultValue) delete n.defaultValue;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'Field') {
    if (!n.alias) delete n.alias;
    if (!n.arguments) delete n.arguments;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (!n.selectionSet) delete n.selectionSet;
  }

  if (n.kind === 'FragmentSpread') {
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'InlineFragment') {
    if (!n.typeCondition) delete n.typeCondition;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'FragmentDefinition') {
    if (!n.variableDefinitions) delete n.variableDefinitions;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'StringValue') {
    if (!n.block) delete n.block;
  }

  if (n.kind === 'Directive') {
    if (!n.arguments) delete n.arguments;
  }

  if (n.kind === 'SchemaDefinition') {
    delete n.description;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'ScalarTypeDefinition') {
    delete n.description;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'ObjectTypeDefinition') {
    delete n.description;
    if (!n.interfaces) delete n.interfaces;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (n.fields && n.fields.length > 0) {
      n.fields = n.fields.map(cleanup);
    } else {
      delete n.fields;
    }
  }

  if (n.kind === 'FieldDefinition') {
    delete n.description;
    if (n.arguments && n.arguments.length > 0) {
      n.arguments = n.arguments.map(cleanup);
    } else {
      delete n.arguments;
    }
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'InputValueDefinition') {
    delete n.description;
    if (!n.defaultValue) delete n.defaultValue;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'InterfaceTypeDefinition') {
    delete n.description;
    if (!n.interfaces) delete n.interfaces;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (n.fields && n.fields.length > 0) {
      n.fields = n.fields.map(cleanup);
    } else {
      delete n.fields;
    }
  }

  if (n.kind === 'UnionTypeDefinition') {
    delete n.description;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (!n.types) delete n.types;
  }

  if (n.kind === 'EnumTypeDefinition') {
    delete n.description;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (n.values && n.values.length > 0) {
      n.values = n.values.map(cleanup);
    } else {
      delete n.values;
    }
  }

  if (n.kind === 'EnumValueDefinition') {
    delete n.description;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'InputObjectTypeDefinition') {
    delete n.description;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (n.fields && n.fields.length > 0) {
      n.fields = n.fields.map(cleanup);
    } else {
      delete n.fields;
    }
  }

  if (n.kind === 'DirectiveDefinition') {
    delete n.description;
    if (!n.arguments) delete n.arguments;
    if (n.arguments && n.arguments.length > 0) {
      n.arguments = n.arguments.map(cleanup);
    } else {
      delete n.arguments;
    }
  }

  if (n.kind === 'SchemaExtension') {
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (!n.operationTypes) delete n.operationTypes;
  }

  if (n.kind === 'ScalarTypeExtension') {
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
  }

  if (n.kind === 'ObjectTypeExtension') {
    if (!n.interfaces) delete n.interfaces;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (n.fields && n.fields.length > 0) {
      n.fields = n.fields.map(cleanup);
    } else {
      delete n.fields;
    }
  }

  if (n.kind === 'InterfaceTypeExtension') {
    if (!n.interfaces) delete n.interfaces;
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (n.fields && n.fields.length > 0) {
      n.fields = n.fields.map(cleanup);
    } else {
      delete n.fields;
    }
  }

  if (n.kind === 'UnionTypeExtension') {
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (!n.types) delete n.types;
  }

  if (n.kind === 'EnumTypeExtension') {
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (n.values && n.values.length > 0) {
      n.values = n.values.map(cleanup);
    } else {
      delete n.values;
    }
  }

  if (n.kind === 'InputObjectTypeExtension') {
    if (Array.isArray(n.directives) && n.directives.length === 0) {
      delete n.directives;
    }
    if (n.fields && n.fields.length > 0) {
      n.fields = n.fields.map(cleanup);
    } else {
      delete n.fields;
    }
  }

  return n as T;
};
