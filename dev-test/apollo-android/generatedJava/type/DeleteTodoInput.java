package type;

import com.apollographql.apollo.api.InputType;
import javax.annotation.Generated;
import java.lang.String;
import javax.annotation.Nullable;
import java.lang.Override;
import java.io.IOException;
import com.apollographql.apollo.api.InputFieldWriter;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.Input;

@Generated("Apollo GraphQL")
public final class DeleteTodoInput implements InputType {
  private final Input<String> id;
  public @Nullable Input<String> id() {
    return this.id;
  }
  
  public DeleteTodoInput(Input<String> id) {
    this.id = id;
  }
  
  public static Builder builder() {
    return new Builder();
  }
  @Override
  public InputFieldMarshaller marshaller() {
    return new InputFieldMarshaller() {
      @Override
      public void marshal(InputFieldWriter writer) throws IOException {
        if(id.defined) {
            writer.writeString("id", id.value);
        }
      }
    };
  }

  public static final class Builder {
    private Input<String> id = Input.absent();
  
    Builder() {}
    
    public Builder id(@Nullable String id) {
      this.id = Input.fromNullable(id);
      return this;
    }
  
    public DeleteTodoInput build() {
    
      return new DeleteTodoInput(id);
    }
  }
  
}

