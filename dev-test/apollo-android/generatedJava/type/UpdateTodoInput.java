package type;

import com.apollographql.apollo.api.InputType;
import javax.annotation.Generated;
import java.lang.String;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.lang.Override;
import java.io.IOException;
import com.apollographql.apollo.api.InputFieldWriter;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.Input;
import com.apollographql.apollo.api.internal.Utils;

@Generated("Apollo GraphQL")
public final class UpdateTodoInput implements InputType {
  private final @Nonnull String id;
  private final Input<String> name;
  private final Input<String> description;
  public @Nonnull String id() {
    return this.id;
  }
  
  public @Nullable Input<String> name() {
    return this.name;
  }
  
  public @Nullable Input<String> description() {
    return this.description;
  }
  
  public UpdateTodoInput(@Nonnull String id, Input<String> name, Input<String> description) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
  
  public static Builder builder() {
    return new Builder();
  }
  @Override
  public InputFieldMarshaller marshaller() {
    return new InputFieldMarshaller() {
      @Override
      public void marshal(InputFieldWriter writer) throws IOException {
        writer.writeString("id", id);
        if(name.defined) {
            writer.writeString("name", name.value);
        }
        if(description.defined) {
            writer.writeString("description", description.value);
        }
      }
    };
  }

  public static final class Builder {
    private @Nonnull String id;
    private Input<String> name = Input.absent();
    private Input<String> description = Input.absent();
  
    Builder() {}
    
    public Builder id(@Nonnull String id) {
      this.id = id;
      return this;
    }
    
    public Builder name(@Nullable String name) {
      this.name = Input.fromNullable(name);
      return this;
    }
    
    public Builder description(@Nullable String description) {
      this.description = Input.fromNullable(description);
      return this;
    }
  
    public UpdateTodoInput build() {
      Utils.checkNotNull(id, "id == null");
      return new UpdateTodoInput(id, name, description);
    }
  }
  
}

