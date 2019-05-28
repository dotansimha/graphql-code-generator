import '@graphql-codegen/testing';
import { buildSchema, Kind } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/plugin';
import { validateJava } from '../../common/tests/validate-java';
import { FileType } from '../src/file-type';

describe('java-apollo-android', () => {
  describe('Input Types', () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        a: String
      }

      input MyInput {
        foo: Int!
        bar: String
        something: Boolean!
        nested: NestedInput
        testArr: [String]
      }

      input NestedInput {
        f: String
      }
    `);
    const config = { typePackage: 'com.app.generated.graphql', fragmentPackage: 'com.app.generated.graphql.fragment', package: 'com.app.generated.graphql', fileType: FileType.INPUT_TYPE };
    const files: Types.DocumentFile[] = [{ content: { kind: Kind.DOCUMENT, definitions: [schema.getType('MyInput').astNode] }, filePath: '' }];

    it('Should produce valid Java code', async () => {
      const result = (await plugin(schema, files, config)) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);
      await validateJava(output);
    });

    it('Should create a basic input type signature correctly', async () => {
      const result = (await plugin(schema, files, config)) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);

      expect(result.prepend).toContain('import com.apollographql.apollo.api.InputType;');
      expect(result.prepend).toContain('import javax.annotation.Generated;');

      expect(output).toContain(`@Generated("Apollo GraphQL")`);
      expect(output).toBeSimilarStringTo(`public final class MyInput implements InputType {`);
    });

    it('Should create private fields correctly', async () => {
      const result = (await plugin(schema, files, config)) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);

      expect(result.prepend).toContain('import com.apollographql.apollo.api.Input;');
      expect(result.prepend).toContain('import java.lang.Integer;');
      expect(result.prepend).toContain('import java.lang.String;');
      expect(result.prepend).toContain('import java.lang.Boolean;');
      expect(result.prepend).toContain('import com.app.generated.graphql.NestedInput;');
      expect(result.prepend).toContain('import javax.annotation.Nonnull;');

      expect(output).toContain(`private final @Nonnull Integer foo;`);
      expect(output).toContain(`private final Input<String> bar;`);
      expect(output).toContain(`private final @Nonnull Boolean something;`);
      expect(output).toContain(`private final Input<NestedInput> nested;`);
      expect(output).toContain(`private final Input<List<String>> testArr;`);
    });

    it('Should create ctor correctly', async () => {
      const result = (await plugin(schema, files, config)) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);

      expect(output).toBeSimilarStringTo(`MyInput(@Nonnull Integer foo, Input<String> bar, @Nonnull Boolean something, Input<NestedInput> nested, Input<List<String>> testArr) {
        this.foo = foo;
        this.bar = bar;
        this.something = something;
        this.nested = nested;
        this.testArr = testArr;
      }
      `);
    });

    it('Should create getters correctly', async () => {
      const result = (await plugin(schema, files, config)) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);

      expect(result.prepend).toContain('import javax.annotation.Nullable;');

      expect(output).toBeSimilarStringTo(`public @Nonnull Integer foo() { return this.foo; }`);
      expect(output).toBeSimilarStringTo(`public @Nullable Input<String> bar() { return this.bar; }`);
      expect(output).toBeSimilarStringTo(`public @Nonnull Boolean something() { return this.something; }`);
      expect(output).toBeSimilarStringTo(`public @Nullable Input<NestedInput> nested() { return this.nested; }`);
      expect(output).toBeSimilarStringTo(`public @Nullable Input<List<String>> testArr() { return this.testArr; }`);
    });

    it('Should have Builder static getter', async () => {
      const result = (await plugin(schema, files, config)) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);

      expect(output).toBeSimilarStringTo(`public static Builder builder() { return new Builder(); }`);
    });

    it('Should have Builder nested class ', async () => {
      const result = (await plugin(schema, files, config)) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);

      expect(output).toBeSimilarStringTo(`public static final class Builder {`);
      expect(output).toBeSimilarStringTo(`
        private @Nonnull Integer foo;
        private Input<String> bar = Input.absent();
        private @Nonnull Boolean something;
        private Input<NestedInput> nested = Input.absent();
        private Input<String> testArr = Input.absent();
      `);
      expect(output).toBeSimilarStringTo(`Builder() {}`);
      expect(output).toBeSimilarStringTo(`public Builder foo(@Nonnull Integer foo) {
        this.foo = foo;
        return this;
      }`);
      expect(output).toBeSimilarStringTo(`public Builder bar(@Nullable String bar) {
        this.bar = Input.fromNullable(bar);
        return this;
      }`);
      expect(output).toBeSimilarStringTo(`public Builder something(@Nonnull Boolean something) {
        this.something = something;
        return this;
      }`);
      expect(output).toBeSimilarStringTo(`public Builder nested(@Nullable NestedInput nested) {
        this.nested = Input.fromNullable(nested);
        return this;
      }`);
      expect(output).toBeSimilarStringTo(`public Builder testArr(@Nullable String testArr) {
        this.testArr = Input.fromNullable(testArr);
        return this;
      }`);
      expect(output).toBeSimilarStringTo(`public MyInput build() {
        Utils.checkNotNull(foo, "foo == null");
        Utils.checkNotNull(something, "something == null");
        return new MyInput(foo, bar, something, nested, testArr);
      }`);
    });

    it('Should have marshaller built for the fields', async () => {
      const result = (await plugin(schema, files, config)) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);

      // Simple, non-null
      expect(output).toBeSimilarStringTo(`writer.writeInt("foo", foo);`);
      // simple, nullable
      expect(output).toBeSimilarStringTo(`if(bar.defined) {
        writer.writeString("bar", bar.value);
  }`);
      // non null, object
      expect(output).toBeSimilarStringTo(`if(nested.defined) {
        writer.writeObject("nested", nested.value != null ? nested.value.marshaller() : null);
  }`);
      // non null, list
      expect(output).toBeSimilarStringTo(`if(testArr.defined) {
                      
        writer.writeList("testArr", testArr.value != null ? new InputFieldWriter.ListWriter() {
          @Override
          public void write(InputFieldWriter.ListItemWriter listItemWriter) throws IOException {
            for (String $item : testArr.value) {
              listItemWriter.writeString($item);
            }
          }
        } : null);
    }`);
    });
  });
});
