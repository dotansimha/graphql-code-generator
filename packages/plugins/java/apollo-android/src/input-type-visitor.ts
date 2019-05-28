import { ParsedConfig, getBaseTypeNode, indent, indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { JavaApolloAndroidPluginConfig } from './plugin';
import { JavaDeclarationBlock, buildPackageNameFromPath } from '@graphql-codegen/java-common';
import { InputObjectTypeDefinitionNode, GraphQLSchema, InputValueDefinitionNode, isScalarType, isInputObjectType, Kind, TypeNode, isEnumType, VariableDefinitionNode } from 'graphql';
import { Imports } from './imports';
import { BaseJavaVisitor, SCALAR_TO_WRITER_METHOD } from './base-java-visitor';
import { VisitorConfig } from './visitor-config';

export class InputTypeVisitor extends BaseJavaVisitor<VisitorConfig> {
  constructor(_schema: GraphQLSchema, rawConfig: JavaApolloAndroidPluginConfig) {
    super(_schema, rawConfig, {
      typePackage: rawConfig.typePackage || 'type',
    });
  }

  public getPackage(): string {
    return this.config.typePackage;
  }

  private buildInputPrivateFields(fields: ReadonlyArray<InputValueDefinitionNode>): string[] {
    return fields
      .map<string>(field => {
        const fieldType = this.getFieldWithTypePrefix(field, 'Input');

        return `private final ${fieldType};`;
      })
      .map(s => indent(s));
  }

  private buildInputCtor(className: string, fields: ReadonlyArray<InputValueDefinitionNode>): string {
    const mappedFields = fields.map<string>(field => this.getFieldWithTypePrefix(field, 'Input'));

    return indentMultiline(`${className}(${mappedFields.join(', ')}) {
${fields.map(field => indent(`this.${field.name.value} = ${field.name.value};`)).join('\n')}
}`);
  }

  private getFieldWriterCall(field: InputValueDefinitionNode, listItemCall = false): string {
    const baseType = getBaseTypeNode(field.type);
    const schemaType = this._schema.getType(baseType.name.value);
    const isNonNull = field.type.kind === Kind.NON_NULL_TYPE;
    let writerMethod = null;

    if (isScalarType(schemaType)) {
      writerMethod = SCALAR_TO_WRITER_METHOD[schemaType.name] || 'writeCustom';
    } else if (isInputObjectType(schemaType)) {
      return listItemCall ? `writeObject($item.marshaller())` : `writeObject("${field.name.value}", ${field.name.value}.value != null ? ${field.name.value}.value.marshaller() : null)`;
    } else if (isEnumType(schemaType)) {
      writerMethod = 'writeString';
    }

    return listItemCall ? `${writerMethod}($item)` : `${writerMethod}("${field.name.value}", ${field.name.value}${isNonNull ? '' : '.value'})`;
  }

  protected getFieldWithTypePrefix(field: InputValueDefinitionNode | VariableDefinitionNode, wrapWith: string | null = null, applyNullable = false): string {
    this._imports.add(Imports.Input);
    const typeToUse = this.getJavaClass(this._schema.getType(getBaseTypeNode(field.type).name.value));
    const isNonNull = field.type.kind === Kind.NON_NULL_TYPE;
    const name = field.kind === Kind.INPUT_VALUE_DEFINITION ? field.name.value : field.variable.name.value;

    if (isNonNull) {
      this._imports.add(Imports.Nonnull);

      return `@Nonnull ${typeToUse} ${name}`;
    } else {
      if (wrapWith) {
        return `${wrapWith}<${typeToUse}> ${name}`;
      } else {
        if (applyNullable) {
          this._imports.add(Imports.Nullable);
        }
        return `${applyNullable ? '@Nullable ' : ''}${typeToUse} ${name}`;
      }
    }
  }

  private buildFieldsMarshaller(field: InputValueDefinitionNode): string {
    const isNonNull = field.type.kind === Kind.NON_NULL_TYPE;
    const isArray = field.type.kind === Kind.LIST_TYPE || (field.type.kind === Kind.NON_NULL_TYPE && field.type.type.kind === Kind.LIST_TYPE);
    const call = this.getFieldWriterCall(field, isArray);
    const baseTypeNode = getBaseTypeNode(field.type);
    const listItemType = this.getJavaClass(this._schema.getType(baseTypeNode.name.value));
    let result = '';

    // TODO: Refactor
    if (isArray) {
      result = `writer.writeList("${field.name.value}", ${field.name.value}.value != null ? new InputFieldWriter.ListWriter() {
  @Override
  public void write(InputFieldWriter.ListItemWriter listItemWriter) throws IOException {
    for (${listItemType} $item : ${field.name.value}.value) {
      listItemWriter.${call};
    }
  }
} : null);`;
    } else {
      result = indent(`writer.${call};`);
    }

    if (isNonNull) {
      return result;
    } else {
      return indentMultiline(`if(${field.name.value}.defined) {
${indentMultiline(result)}
}`);
    }
  }

  private buildMarshallerOverride(fields: ReadonlyArray<InputValueDefinitionNode>): string {
    this._imports.add(Imports.Override);
    this._imports.add(Imports.IOException);
    this._imports.add(Imports.InputFieldWriter);
    this._imports.add(Imports.InputFieldMarshaller);
    const allMarshallers = fields.map(field => indentMultiline(this.buildFieldsMarshaller(field), 2));

    return indentMultiline(`@Override
public InputFieldMarshaller marshaller() {
  return new InputFieldMarshaller() {
    @Override
    public void marshal(InputFieldWriter writer) throws IOException {
${allMarshallers.join('\n')}
    }
  };
}`);
  }

  private buildBuilderNestedClass(className: string, fields: ReadonlyArray<InputValueDefinitionNode>): string {
    const builderClassName = 'Builder';
    const privateFields = fields
      .map<string>(field => {
        const fieldType = this.getFieldWithTypePrefix(field, 'Input');
        const isNonNull = field.type.kind === Kind.NON_NULL_TYPE;

        return `private ${fieldType}${isNonNull ? '' : ' = Input.absent()'};`;
      })
      .map(s => indent(s));

    const setters = fields
      .map<string>(field => {
        const fieldType = this.getFieldWithTypePrefix(field, null);
        const isNonNull = field.type.kind === Kind.NON_NULL_TYPE;

        return `\npublic ${builderClassName} ${field.name.value}(${isNonNull ? '' : '@Nullable '}${fieldType}) {
  this.${field.name.value} = ${isNonNull ? field.name.value : `Input.fromNullable(${field.name.value})`};
  return this;
}`;
      })
      .map(s => indentMultiline(s));

    const nonNullFields = fields
      .filter(f => f.type.kind === Kind.NON_NULL_TYPE)
      .map<string>(nnField => {
        this._imports.add(Imports.Utils);

        return indent(`Utils.checkNotNull(${nnField.name.value}, "${nnField.name.value} == null");`, 1);
      });

    const ctor = '\n' + indent(`${builderClassName}() {}`);
    const buildFn = indentMultiline(`public ${className} build() {
${nonNullFields.join('\n')}
  return new ${className}(${fields.map(f => f.name.value).join(', ')});
}`);
    const body = [...privateFields, ctor, ...setters, '', buildFn].join('\n');

    return indentMultiline(
      new JavaDeclarationBlock()
        .withName(builderClassName)
        .access('public')
        .final()
        .static()
        .withBlock(body)
        .asKind('class').string
    );
  }

  private buildInputGetters(fields: ReadonlyArray<InputValueDefinitionNode>): string[] {
    return fields
      .map<string>(field => {
        this._imports.add(Imports.Input);
        const fieldType = this.getFieldWithTypePrefix(field, 'Input');
        const isNullable = field.type.kind !== Kind.NON_NULL_TYPE;

        if (isNullable) {
          this._imports.add(Imports.Nullable);
        }

        return `public ${isNullable ? '@Nullable ' : ''}${fieldType}() { return this.${field.name.value}; }`;
      })
      .map(s => indent(s));
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    const className = node.name.value;
    this._imports.add(Imports.InputType);
    this._imports.add(Imports.Generated);

    const privateFields = this.buildInputPrivateFields(node.fields);
    const ctor = this.buildInputCtor(className, node.fields);
    const getters = this.buildInputGetters(node.fields);
    const builderGetter = indent(`public static Builder builder() { return new Builder(); }`);
    const marshallerOverride = this.buildMarshallerOverride(node.fields);
    const builderClass = this.buildBuilderNestedClass(className, node.fields);

    const classBlock = [...privateFields, '', ctor, '', ...getters, '', builderGetter, '', marshallerOverride, '', builderClass].join('\n');

    return new JavaDeclarationBlock()
      .annotate([`Generated("Apollo GraphQL")`])
      .access('public')
      .final()
      .asKind('class')
      .withName(className)
      .withBlock(classBlock)
      .implements(['InputType']).string;
  }
}
