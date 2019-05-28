import { BaseJavaVisitor, SCALAR_TO_WRITER_METHOD } from './base-java-visitor';
import { ParsedConfig, toPascalCase, indent, indentMultiline, getBaseType, LoadedFragment, getBaseTypeNode } from '@graphql-codegen/visitor-plugin-common';
import { buildPackageNameFromPath, JavaDeclarationBlock } from '@graphql-codegen/java-common';
import {
  GraphQLSchema,
  OperationDefinitionNode,
  print,
  Kind,
  GraphQLNamedType,
  GraphQLObjectType,
  SelectionNode,
  isNonNullType,
  GraphQLOutputType,
  isScalarType,
  isEnumType,
  InlineFragmentNode,
  isUnionType,
  isInterfaceType,
  isObjectType,
  VariableDefinitionNode,
  isInputObjectType,
  GraphQLString,
  ArgumentNode,
  visit,
  ObjectValueNode,
  ObjectFieldNode,
  IntValueNode,
  FloatValueNode,
  isListType,
  FieldNode,
  VariableNode,
  StringValueNode,
} from 'graphql';
import { JavaApolloAndroidPluginConfig } from './plugin';
import { Imports } from './imports';
import { createHash } from 'crypto';
import { VisitorConfig } from './visitor-config';
import { singular, isPlural } from 'pluralize';
import { visitFieldArguments } from './sub-visitors/field-arguments';

export interface ChildField {
  type: GraphQLNamedType;
  rawType: GraphQLOutputType;
  isNonNull: boolean;
  isList: boolean;
  annotation: string;
  className: string;
  fieldName: string;
  isObject: boolean;
}

export interface TransformSelectionSetOptions {
  additionalFragments?: LoadedFragment[];
  additionalFields?: ChildField[];
  className: string;
  schemaType: GraphQLNamedType;
  implements?: string[];
  selectionSet: ReadonlyArray<SelectionNode>;
  result: { [typeName: string]: JavaDeclarationBlock };
}

export class OperationVisitor extends BaseJavaVisitor<VisitorConfig> {
  constructor(_schema: GraphQLSchema, rawConfig: JavaApolloAndroidPluginConfig, private _availableFragments: LoadedFragment[]) {
    super(_schema, rawConfig, {
      package: rawConfig.package || buildPackageNameFromPath(process.cwd()),
      fragmentPackage: rawConfig.fragmentPackage || 'fragment',
      inputPackage: rawConfig.typePackage || 'type',
    });
  }

  private printOperation(node: OperationDefinitionNode): string {
    return print(node)
      .replace(/\r?\n|\r/g, ' ')
      .replace(/"/g, '\\"')
      .trim();
  }

  private buildCtor(className: string, node: OperationDefinitionNode): string {
    const variables = node.variableDefinitions || [];
    const hasVariables = variables.length > 0;
    const variablesArgs = (node.variableDefinitions || []).map(v => this.getFieldWithTypePrefix(v, null, true)).join(', ');
    const nonNullVariables = variables
      .filter(v => v.type.kind === Kind.NON_NULL_TYPE)
      .map(v => {
        this._imports.add(Imports.Utils);

        return indent(`Utils.checkNotNull(${v.variable.name.value}, "${v.variable.name.value} == null");`);
      })
      .join('\n');

    return indentMultiline(`public ${className}(${variablesArgs}) {
${nonNullVariables}      
  this.variables = ${!hasVariables ? 'Operation.EMPTY_VARIABLES' : `new ${className}.Variables(${variables.map(v => v.variable.name.value).join(', ')})`};
}`);
  }

  private getRootType(operation: string): GraphQLObjectType {
    if (operation === 'query') {
      return this._schema.getQueryType();
    } else if (operation === 'mutation') {
      return this._schema.getMutationType();
    } else if (operation === 'subscription') {
      return this._schema.getSubscriptionType();
    } else {
      return null;
    }
  }

  private createUniqueClassName(inUse: string[], name: string, count = 0): string {
    const possibleNewName = count === 0 ? name : `${name}${count}`;

    while (inUse.includes(possibleNewName)) {
      return this.createUniqueClassName(inUse, name, count + 1);
    }

    return possibleNewName;
  }

  private getListTypeWrapped(toWrap: string, type: GraphQLOutputType): string {
    if (isNonNullType(type)) {
      return this.getListTypeWrapped(toWrap, type.ofType);
    }

    if (isListType(type)) {
      const child = this.getListTypeWrapped(toWrap, type.ofType);

      return `List<${child}>`;
    }

    return toWrap;
  }

  private transformSelectionSet(options: TransformSelectionSetOptions, isRoot = true) {
    if (!options.result) {
      options.result = {};
    }

    if (!isObjectType(options.schemaType) && !isInterfaceType(options.schemaType)) {
      return options.result;
    }

    const className = this.createUniqueClassName(Object.keys(options.result), options.className);
    const cls = new JavaDeclarationBlock()
      .access('public')
      .static()
      .asKind('class')
      .withName(className)
      .implements(options.implements || []);

    options.result[className] = cls;

    const fields = options.schemaType.getFields();
    const childFields: ChildField[] = [...(options.additionalFields || [])];
    const childInlineFragments: { onType: string; node: InlineFragmentNode }[] = [];
    const childFragmentSpread: LoadedFragment[] = [...(options.additionalFragments || [])];

    const selections = [...(options.selectionSet || [])];
    const responseFieldArr: string[] = [];

    for (const selection of selections) {
      if (selection.kind === Kind.FIELD) {
        this._imports.add(Imports.ResponseField);
        const field = fields[selection.name.value];
        const isObject = selection.selectionSet && selection.selectionSet.selections && selection.selectionSet.selections.length > 0;
        const isNonNull = isNonNullType(field.type);
        const fieldAnnotation = isNonNull ? 'Nonnull' : 'Nullable';
        const baseType = getBaseType(field.type);
        const isList = isListType(field.type) || (isNonNullType(field.type) && isListType(field.type.ofType));

        if (isObject) {
          let childClsName = this.convertName(field.name);

          if (isList && isPlural(childClsName)) {
            childClsName = singular(childClsName);
          }

          this.transformSelectionSet(
            {
              className: childClsName,
              result: options.result,
              selectionSet: selection.selectionSet.selections,
              schemaType: baseType as GraphQLObjectType,
            },
            false
          );

          childFields.push({
            rawType: field.type,
            isObject: true,
            isList,
            type: baseType,
            isNonNull,
            annotation: fieldAnnotation,
            className: childClsName,
            fieldName: field.name,
          });
        } else {
          const javaClass = this.getActualType(baseType);

          childFields.push({
            rawType: field.type,
            isObject: false,
            isList: isList,
            type: baseType,
            isNonNull,
            annotation: fieldAnnotation,
            className: javaClass,
            fieldName: field.name,
          });
        }

        this._imports.add(Imports.ResponseField);
        this._imports.add(Imports.Collections);

        const operationArgs = visitFieldArguments(selection as FieldNode, this._imports);
        const responseFieldMethod = this._resolveResponseFieldMethod(field.type);

        responseFieldArr.push(
          `ResponseField.${responseFieldMethod}("${selection.alias ? selection.alias.value : selection.name.value}", "${selection.name.value}", ${operationArgs}, ${!isNonNullType(field.type)}, Collections.<ResponseField.Condition>emptyList())`
        );
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        if (isUnionType(options.schemaType) || isInterfaceType(options.schemaType)) {
          childInlineFragments.push({
            onType: selection.typeCondition.name.value,
            node: selection,
          });
        } else {
          selections.push(...selection.selectionSet.selections);
        }
      } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
        const fragment = this._availableFragments.find(f => f.name === selection.name.value);

        if (fragment) {
          childFragmentSpread.push(fragment);
          this._imports.add(`${this.config.fragmentPackage}.${fragment.name}`);
        } else {
          throw new Error(`Fragment with name ${selection.name.value} was not loaded as document!`);
        }
      }
    }

    if (childInlineFragments.length > 0) {
      const childFieldsBase = [...childFields];
      childFields.push(
        ...childInlineFragments.map(inlineFragment => {
          const cls = `As${inlineFragment.onType}`;
          const schemaType = this._schema.getType(inlineFragment.onType);

          this.transformSelectionSet(
            {
              additionalFields: childFieldsBase,
              additionalFragments: childFragmentSpread,
              className: cls,
              result: options.result,
              selectionSet: inlineFragment.node.selectionSet.selections,
              schemaType,
            },
            false
          );

          return {
            rawType: schemaType as GraphQLOutputType,
            isObject: true,
            isList: false,
            type: schemaType,
            isNonNull: false,
            annotation: 'Nullable',
            className: cls,
            fieldName: `as${inlineFragment.onType}`,
          };
        })
      );

      responseFieldArr.push(...childInlineFragments.map(f => `ResponseField.forInlineFragment("__typename", "__typename", Arrays.asList("${f.onType}"))`));
    }

    if (childFragmentSpread.length > 0) {
      responseFieldArr.push(`ResponseField.forFragment("__typename", "__typename", Arrays.asList(${childFragmentSpread.map(f => `"${f.onType}"`).join(', ')}))`);

      childFields.push({
        isObject: true,
        isList: false,
        rawType: options.schemaType,
        type: options.schemaType,
        isNonNull: true,
        annotation: 'Nonnull',
        className: 'Fragments',
        fieldName: 'fragments',
      });
    }

    if (responseFieldArr.length > 0 && !isRoot) {
      responseFieldArr.unshift(`ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList())`);
    }

    if (!isRoot) {
      childFields.unshift({
        isObject: false,
        isList: false,
        type: GraphQLString,
        rawType: GraphQLString,
        isNonNull: true,
        annotation: 'Nonnull',
        className: 'String',
        fieldName: '__typename',
      });
    }

    // Add members
    childFields.forEach(c => {
      cls.addClassMember(c.fieldName, this.getListTypeWrapped(c.className, c.rawType), null, [c.annotation], 'private', { final: true });
    });

    // Add $toString, $hashCode, $hashCodeMemoized
    cls.addClassMember('$toString', 'String', null, [], 'private', { volatile: true });
    cls.addClassMember('$hashCode', 'int', null, [], 'private', { volatile: true });
    cls.addClassMember('$hashCodeMemoized', 'boolean', null, [], 'private', { volatile: true });
    // Add responseFields for all fields
    cls.addClassMember('$responseFields', 'ResponseField[]', `{\n${indentMultiline(responseFieldArr.join(',\n'), 2) + '\n  }'}`, [], null, { static: true, final: true });
    // Add Ctor
    cls.addClassMethod(
      className,
      null,
      childFields.map(c => `this.${c.fieldName} = ${c.isNonNull ? `Utils.checkNotNull(${c.fieldName}, "${c.fieldName} == null")` : c.fieldName};`).join('\n'),
      childFields.map(c => ({ name: c.fieldName, type: this.getListTypeWrapped(c.className, c.rawType), annotations: [c.annotation] })),
      null,
      'public'
    );

    // Add getters for all members
    childFields.forEach(c => {
      cls.addClassMethod(c.fieldName, this.getListTypeWrapped(c.className, c.rawType), `return this.${c.fieldName};`, [], [c.annotation], 'public', {});
    });

    // Add .toString()
    cls.addClassMethod(
      'toString',
      'String',
      `if ($toString == null) {
  $toString = "${className}{"
${childFields.map(c => indent(`+ "${c.fieldName}=" + ${c.fieldName} + ", "`, 2)).join('\n')}
    + "}";
}

return $toString;`,
      [],
      [],
      'public',
      {},
      ['Override']
    );

    // Add equals
    cls.addClassMethod(
      'equals',
      'boolean',
      `if (o == this) {
  return true;
}
if (o instanceof ${className}) {
  ${className} that = (${className}) o;
  return ${childFields.map(c => (c.isNonNull ? `this.${c.fieldName}.equals(that.${c.fieldName})` : `((this.${c.fieldName} == null) ? (that.${c.fieldName} == null) : this.${c.fieldName}.equals(that.${c.fieldName}))`)).join(' && ')};
}

return false;`,
      [],
      [],
      'public',
      {},
      ['Override']
    );

    // hashCode
    cls.addClassMethod(
      'hashCode',
      'int',
      `if (!$hashCodeMemoized) {
  int h = 1;
${childFields.map(f => indentMultiline(`h *= 1000003;\nh ^= ${!f.isNonNull ? `(${f.fieldName} == null) ? 0 : ` : ''}${f.fieldName}.hashCode();`, 1)).join('\n')}
  $hashCode = h;
  $hashCodeMemoized = true;
}

return $hashCode;`,
      [],
      [],
      'public',
      {},
      ['Override']
    );

    this._imports.add(Imports.ResponseReader);
    this._imports.add(Imports.ResponseFieldMarshaller);
    this._imports.add(Imports.ResponseWriter);

    // marshaller
    cls.addClassMethod(
      'marshaller',
      'ResponseFieldMarshaller',
      `return new ResponseFieldMarshaller() {
  @Override
  public void marshal(ResponseWriter writer) {
${childFields
  .map((f, index) => {
    const writerMethod = this._getWriterMethodByType(f.type);

    if (f.isList) {
      return indentMultiline(
        `writer.writeList($responseFields[${index}], ${f.fieldName}, new ResponseWriter.ListWriter() {
  @Override
  public void write(Object value, ResponseWriter.ListItemWriter listItemWriter) {
    listItemWriter.${writerMethod.name}(((${f.className}) value)${writerMethod.useMarshaller ? '.marshaller()' : ''});
  }
});`,
        2
      );
    }

    let fValue = `${f.fieldName}${writerMethod.useMarshaller ? '.marshaller()' : ''}`;

    if (writerMethod.checkNull || !f.isNonNull) {
      fValue = `${f.fieldName} != null ? ${fValue} : null`;
    }

    return indent(`writer.${writerMethod.name}(${writerMethod.castTo ? `(${writerMethod.castTo}) ` : ''}$responseFields[${index}], ${fValue});`, 2);
  })
  .join('\n')}
  }
};`,
      [],
      [],
      'public'
    );

    cls.nestedClass(this.buildMapperClass(className, childFields));

    return options.result;
  }

  private getReaderFn(baseType: GraphQLNamedType): string {
    if (isScalarType(baseType)) {
      if (baseType.name === 'String') {
        return `readString`;
      } else if (baseType.name === 'Int') {
        return `readInt`;
      } else if (baseType.name === 'Float') {
        return `readDouble`;
      } else if (baseType.name === 'Boolean') {
        return `readBoolean`;
      } else {
        return `readCustomType`;
      }
    } else if (isEnumType(baseType)) {
      return `readString`;
    } else {
      return `readObject`;
    }
  }

  private buildMapperClass(parentClassName: string, childFields: ChildField[]): JavaDeclarationBlock {
    const wrapList = (childField: ChildField, rawType: GraphQLOutputType, edgeStr: string) => {
      if (isNonNullType(rawType)) {
        return wrapList(childField, rawType.ofType, edgeStr);
      }

      if (isListType(rawType)) {
        const typeStr = this.getListTypeWrapped(childField.className, rawType.ofType);
        const innerContent = wrapList(childField, rawType.ofType, edgeStr);
        const inner = isListType(rawType.ofType) ? `return listItemReader.readList(${innerContent});` : innerContent;

        return `new ResponseReader.ListReader<${typeStr}>() {
  @Override
  public ${typeStr} read(ResponseReader.ListItemReader listItemReader) {
${indentMultiline(inner, 2)}
  }
}`;
      }

      return edgeStr;
    };

    const mapperBody = childFields.map((f, index) => {
      const varDec = `final ${this.getListTypeWrapped(f.className, f.rawType)} ${f.fieldName} =`;
      const readerFn = this.getReaderFn(f.type);

      if (f.isList) {
        const wrappedList = wrapList(f, f.rawType, `return listItemReader.${readerFn}();`);

        return `${varDec} reader.readList($responseFields[${index}], ${wrappedList});`;
      } else {
        return `${varDec} reader.${readerFn}(${readerFn === 'readCustomType' ? '(ResponseField.CustomTypeField) ' : ''}$responseFields[${index}]);`;
      }
    });

    const mapperImpl = [...mapperBody, `return new ${parentClassName}(${childFields.map(f => f.fieldName).join(', ')});`].join('\n');

    const cls = new JavaDeclarationBlock()
      .access('public')
      .static()
      .final()
      .asKind('class')
      .withName('Mapper')
      .implements([`ResponseFieldMapper<${parentClassName}>`])
      .addClassMethod(
        'map',
        parentClassName,
        mapperImpl,
        [
          {
            name: 'reader',
            type: 'ResponseReader',
          },
        ],
        [],
        'public',
        {},
        ['Override']
      );

    childFields
      .filter(c => c.isObject)
      .forEach(childField => {
        cls.addClassMember(`${childField.fieldName}FieldMapper`, `${childField.className}.Mapper`, `new ${childField.className}.Mapper()`, [], 'private', { final: true });
      });

    return cls;
  }

  private _resolveResponseFieldMethod(type: GraphQLOutputType): string {
    const baseType = getBaseType(type);

    return this._resolveResponseFieldMethodForBaseType(baseType);
  }

  private _resolveResponseFieldMethodForBaseType(baseType: GraphQLNamedType): string {
    if (isScalarType(baseType)) {
      if (baseType.name === 'String') {
        return `forString`;
      } else if (baseType.name === 'Int') {
        return `forInt`;
      } else if (baseType.name === 'Float') {
        return `forDouble`;
      } else if (baseType.name === 'Boolean') {
        return `forBoolean`;
      } else {
        return `forCustomType`;
      }
    } else if (isEnumType(baseType)) {
      return `forEnum`;
    } else {
      return `forObject`;
    }
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const operationType = toPascalCase(node.operation);
    const operationSchemaType = this.getRootType(node.operation);
    const className = node.name.value.endsWith(operationType) ? operationType : `${node.name.value}${operationType}`;
    this._imports.add(Imports[operationType]);
    this._imports.add(Imports.String);
    this._imports.add(Imports.Override);
    this._imports.add(Imports.Generated);
    this._imports.add(Imports.OperationName);
    this._imports.add(Imports.ResponseFieldMapper);

    const printedOperation = this.printOperation(node);
    const cls = new JavaDeclarationBlock()
      .annotate([`Generated("Apollo GraphQL")`])
      .access('public')
      .final()
      .asKind('class')
      .withName(className)
      .implements([`${operationType}<${className}.Data, ${className}.Data, ${className}.Variables>`]);

    cls.addClassMember('OPERATION_DEFINITION', 'String', `"${printedOperation}"`, [], 'public', { static: true, final: true });
    cls.addClassMember('QUERY_DOCUMENT', 'String', 'OPERATION_DEFINITION', [], 'public', { static: true, final: true });
    cls.addClassMember(
      'OPERATION_NAME',
      'OperationName',
      `new OperationName() {
  @Override
  public String name() {
    return "${node.name.value}";
  }
}`,
      [],
      'public',
      { static: true, final: true }
    );
    cls.addClassMember('variables', `${className}.Variables`, null, [], 'private', { final: true });
    cls.addClassMethod('queryDocument', `String`, `return QUERY_DOCUMENT;`, [], [], 'public', {}, ['Override']);
    cls.addClassMethod(
      'wrapData',
      `${className}.Data`,
      `return data;`,
      [
        {
          name: 'data',
          type: `${className}.Data`,
        },
      ],
      [],
      'public',
      {},
      ['Override']
    );
    cls.addClassMethod('variables', `${className}.Variables`, `return variables;`, [], [], 'public', {}, ['Override']);
    cls.addClassMethod('responseFieldMapper', `ResponseFieldMapper<${className}.Data>`, `return new Data.Mapper();`, [], [], 'public', {}, ['Override']);
    cls.addClassMethod('builder', `Builder`, `new Builder();`, [], [], 'public', { static: true }, []);
    cls.addClassMethod('name', `OperationName`, `return OPERATION_NAME;`, [], [], 'public', {}, ['Override']);
    cls.addClassMethod(
      'operationId',
      `String`,
      `return "${createHash('md5')
        .update(printedOperation)
        .digest('hex')}";`,
      [],
      [],
      'public',
      {},
      []
    );

    const ctor = this.buildCtor(className, node);

    const dataClasses = this.transformSelectionSet({
      className: 'Data',
      implements: ['Operation.Data'],
      selectionSet: node.selectionSet && node.selectionSet.selections ? node.selectionSet.selections : [],
      result: {},
      schemaType: operationSchemaType,
    });

    Object.keys(dataClasses).forEach(className => {
      cls.nestedClass(dataClasses[className]);
    });

    cls.nestedClass(this.createBuilderClass(className, node.variableDefinitions || []));
    cls.nestedClass(this.createVariablesClass(className, node.variableDefinitions || []));
    cls.withBlock(ctor);

    return cls.string;
  }

  private createVariablesClass(parentClassName: string, variables: ReadonlyArray<VariableDefinitionNode>): JavaDeclarationBlock {
    const className = 'Variables';
    const cls = new JavaDeclarationBlock()
      .static()
      .access('public')
      .final()
      .asKind('class')
      .extends(['Operation.Variables'])
      .withName(className);

    const ctorImpl: string[] = [];
    const ctorArgs = [];

    variables.forEach(variable => {
      ctorImpl.push(`this.${variable.variable.name.value} = ${variable.variable.name.value};`);
      ctorImpl.push(`this.valueMap.put("${variable.variable.name.value}", ${variable.variable.name.value});`);
      const baseTypeNode = getBaseTypeNode(variable.type);
      const schemaType = this._schema.getType(baseTypeNode.name.value);
      const javaClass = this.getActualType(schemaType);
      const annotation = isNonNullType(variable.type) ? 'Nullable' : 'Nonnull';
      ctorArgs.push({ name: variable.variable.name.value, type: javaClass, annotations: [annotation] });
      cls.addClassMember(variable.variable.name.value, javaClass, null, [annotation], 'private');
      cls.addClassMethod(variable.variable.name.value, javaClass, `return ${variable.variable.name.value};`, [], [], 'public');
    });

    cls.addClassMethod(className, null, ctorImpl.join('\n'), ctorArgs, [], 'public');
    cls.addClassMember('valueMap', 'Map<String, Object>', 'new LinkedHashMap<>()', [], 'private', { final: true, transient: true });
    cls.addClassMethod('valueMap', 'Map<String, Object>', 'return Collections.unmodifiableMap(valueMap);', [], [], 'public', {}, ['Override']);

    const marshallerImpl = `return new InputFieldMarshaller() {
  @Override
  public void marshal(InputFieldWriter writer) throws IOException {
${variables
  .map(v => {
    const baseTypeNode = getBaseTypeNode(v.type);
    const schemaType = this._schema.getType(baseTypeNode.name.value);
    const writerMethod = this._getWriterMethodByType(schemaType);

    return indent(
      `writer.${writerMethod.name}("${v.variable.name.value}", ${writerMethod.checkNull ? `${v.variable.name.value} != null ? ${v.variable.name.value}${writerMethod.useMarshaller ? '.marshaller()' : ''} : null` : v.variable.name.value});`,
      2
    );
  })
  .join('\n')}
  }
};`;
    this._imports.add(Imports.InputFieldMarshaller);
    this._imports.add(Imports.InputFieldWriter);
    this._imports.add(Imports.IOException);
    cls.addClassMethod('marshaller', 'InputFieldMarshaller', marshallerImpl, [], [], 'public', {}, ['Override']);

    return cls;
  }

  private _getWriterMethodByType(schemaType: GraphQLNamedType): { name: string; checkNull: boolean; useMarshaller: boolean; castTo?: string } {
    if (isScalarType(schemaType)) {
      if (SCALAR_TO_WRITER_METHOD[schemaType.name] && schemaType.name !== 'ID') {
        return {
          name: SCALAR_TO_WRITER_METHOD[schemaType.name],
          checkNull: false,
          useMarshaller: false,
        };
      }

      return { name: 'writeCustom', checkNull: false, useMarshaller: false, castTo: 'ResponseField.CustomTypeField' };
    } else if (isInputObjectType(schemaType)) {
      return { name: 'writeObject', checkNull: true, useMarshaller: true };
    } else if (isEnumType(schemaType)) {
      return { name: 'writeString', checkNull: false, useMarshaller: false };
    } else if (isObjectType(schemaType) || isInterfaceType(schemaType)) {
      return { name: 'writeObject', checkNull: true, useMarshaller: true };
    }

    return { name: 'writeString', useMarshaller: false, checkNull: false };
  }

  private createBuilderClass(parentClassName: string, variables: ReadonlyArray<VariableDefinitionNode>): JavaDeclarationBlock {
    const builderClassName = 'Builder';
    const cls = new JavaDeclarationBlock()
      .static()
      .final()
      .access('public')
      .asKind('class')
      .withName(builderClassName)
      .addClassMethod(builderClassName, null, '');

    variables.forEach(variable => {
      const baseTypeNode = getBaseTypeNode(variable.type);
      const schemaType = this._schema.getType(baseTypeNode.name.value);
      const javaClass = this.getActualType(schemaType);
      const annotations = [isNonNullType(variable.type) ? 'Nonnull' : 'Nullable'];
      cls.addClassMember(variable.variable.name.value, javaClass, null, annotations, 'private');
      cls.addClassMethod(
        variable.variable.name.value,
        builderClassName,
        `this.${variable.variable.name.value} = ${variable.variable.name.value};\nreturn this;`,
        [
          {
            name: variable.variable.name.value,
            type: javaClass,
            annotations,
          },
        ],
        [],
        'public'
      );
    });

    const nonNullChecks = variables.filter(f => isNonNullType(f)).map(f => `Utils.checkNotNull(${f.variable.name.value}, "${f.variable.name.value} == null");`);
    const returnStatement = `return new ${parentClassName}(${variables.map(v => v.variable.name.value).join(', ')});`;
    cls.addClassMethod('build', parentClassName, `${[...nonNullChecks, returnStatement].join('\n')}`, [], [], 'public');

    return cls;
  }
}
