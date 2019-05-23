package undefined;

import com.apollographql.apollo.api.InputType;
import javax.annotation.Generated;
import com.apollographql.apollo.api.Input;
import java.lang.String;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.lang.Override;
import java.io.IOException;
import com.apollographql.apollo.api.InputFieldWriter;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.internal.Utils;

@Generated("Apollo GraphQL")
public final class CreateTodoInput implements InputType {
  private final Input<String> id;
  private final @Nonnull String name;
  private final Input<String> description;

  CreateTodoInput(Input<String> id, @Nonnull String name, Input<String> description) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  public @Nullable Input<String> id() { return this.id; }
  public @Nonnull String name() { return this.name; }
  public @Nullable Input<String> description() { return this.description; }

  public static Builder builder() { return new Builder(); }

  @Override
  public InputFieldMarshaller marshaller() {
    return new InputFieldMarshaller() {
      @Override
      public void marshal(InputFieldWriter writer) throws IOException {
        if(id.defined) {
            writer.writeString("id", id.value);
        }
        writer.writeString("name", name);
        if(description.defined) {
            writer.writeString("description", description.value);
        }
      }
    };
  }

  public static final class Builder {
    private Input<String> id = Input.absent();
    private @Nonnull String name;
    private Input<String> description = Input.absent();
  
    Builder() {}
    
    public Builder id(@Nullable String id) {
      this.id = Input.fromNullable(id);
      return this;
    }
    
    public Builder name(@Nonnull String name) {
      this.name = name;
      return this;
    }
    
    public Builder description(@Nullable String description) {
      this.description = Input.fromNullable(description);
      return this;
    }
  
    public CreateTodoInput build() {
      Utils.checkNotNull(name, "name == null");
      return new CreateTodoInput(id, name, description);
    }
  }
  
}
