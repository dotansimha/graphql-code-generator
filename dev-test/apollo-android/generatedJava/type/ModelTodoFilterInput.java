package .Users.dotansimha.Dev.graphql-code-generator.dev-test.apollo-android;

import com.apollographql.apollo.api.InputType;
import javax.annotation.Generated;
import com.apollographql.apollo.api.Input;
import .Users.dotansimha.Dev.graphql-code-generator.dev-test.apollo-android.ModelIDFilterInput;
import .Users.dotansimha.Dev.graphql-code-generator.dev-test.apollo-android.ModelStringFilterInput;
import .Users.dotansimha.Dev.graphql-code-generator.dev-test.apollo-android.ModelTodoFilterInput;
import java.util.List;
import javax.annotation.Nullable;
import java.lang.Override;
import java.io.IOException;
import com.apollographql.apollo.api.InputFieldWriter;
import com.apollographql.apollo.api.InputFieldMarshaller;

@Generated("Apollo GraphQL")
public final class ModelTodoFilterInput implements InputType {
  private final Input<ModelIDFilterInput> id;
  private final Input<ModelStringFilterInput> name;
  private final Input<ModelStringFilterInput> description;
  private final Input<List<ModelTodoFilterInput>> and;
  private final Input<List<ModelTodoFilterInput>> or;
  private final Input<ModelTodoFilterInput> not;

  ModelTodoFilterInput(Input<ModelIDFilterInput> id, Input<ModelStringFilterInput> name, Input<ModelStringFilterInput> description, Input<List<ModelTodoFilterInput>> and, Input<List<ModelTodoFilterInput>> or, Input<ModelTodoFilterInput> not) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.and = and;
    this.or = or;
    this.not = not;
  }

  public @Nullable Input<ModelIDFilterInput> id() { return this.id; }
  public @Nullable Input<ModelStringFilterInput> name() { return this.name; }
  public @Nullable Input<ModelStringFilterInput> description() { return this.description; }
  public @Nullable Input<List<ModelTodoFilterInput>> and() { return this.and; }
  public @Nullable Input<List<ModelTodoFilterInput>> or() { return this.or; }
  public @Nullable Input<ModelTodoFilterInput> not() { return this.not; }

  public static Builder builder() { return new Builder(); }

  @Override
  public InputFieldMarshaller marshaller() {
    return new InputFieldMarshaller() {
      @Override
      public void marshal(InputFieldWriter writer) throws IOException {
        if(id.defined) {
            writer.writeObject("id", id.value != null ? id.value.marshaller() : null);
        }
        if(name.defined) {
            writer.writeObject("name", name.value != null ? name.value.marshaller() : null);
        }
        if(description.defined) {
            writer.writeObject("description", description.value != null ? description.value.marshaller() : null);
        }
        if(and.defined) {
          writer.writeList("and", and.value != null ? new InputFieldWriter.ListWriter() {
            @Override
            public void write(InputFieldWriter.ListItemWriter listItemWriter) throws IOException {
              for (ModelTodoFilterInput $item : and.value) {
                listItemWriter.writeObject($item.marshaller());
              }
            }
          } : null);
        }
        if(or.defined) {
          writer.writeList("or", or.value != null ? new InputFieldWriter.ListWriter() {
            @Override
            public void write(InputFieldWriter.ListItemWriter listItemWriter) throws IOException {
              for (ModelTodoFilterInput $item : or.value) {
                listItemWriter.writeObject($item.marshaller());
              }
            }
          } : null);
        }
        if(not.defined) {
            writer.writeObject("not", not.value != null ? not.value.marshaller() : null);
        }
      }
    };
  }

  public static final class Builder {
    private Input<ModelIDFilterInput> id = Input.absent();
    private Input<ModelStringFilterInput> name = Input.absent();
    private Input<ModelStringFilterInput> description = Input.absent();
    private Input<List<ModelTodoFilterInput>> and = Input.absent();
    private Input<List<ModelTodoFilterInput>> or = Input.absent();
    private Input<ModelTodoFilterInput> not = Input.absent();
  
    Builder() {}
    
    public Builder id(@Nullable ModelIDFilterInput id) {
      this.id = Input.fromNullable(id);
      return this;
    }
    
    public Builder name(@Nullable ModelStringFilterInput name) {
      this.name = Input.fromNullable(name);
      return this;
    }
    
    public Builder description(@Nullable ModelStringFilterInput description) {
      this.description = Input.fromNullable(description);
      return this;
    }
    
    public Builder and(@Nullable List<ModelTodoFilterInput> and) {
      this.and = Input.fromNullable(and);
      return this;
    }
    
    public Builder or(@Nullable List<ModelTodoFilterInput> or) {
      this.or = Input.fromNullable(or);
      return this;
    }
    
    public Builder not(@Nullable ModelTodoFilterInput not) {
      this.not = Input.fromNullable(not);
      return this;
    }
  
    public ModelTodoFilterInput build() {
    
      return new ModelTodoFilterInput(id, name, description, and, or, not);
    }
  }
  
}
