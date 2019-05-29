package type;

import com.apollographql.apollo.api.InputType;
import javax.annotation.Generated;
import java.lang.Boolean;
import javax.annotation.Nullable;
import java.lang.Override;
import java.io.IOException;
import com.apollographql.apollo.api.InputFieldWriter;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.Input;

@Generated("Apollo GraphQL")
public final class ModelBooleanFilterInput implements InputType {
  private final Input<Boolean> ne;
  private final Input<Boolean> eq;
  public @Nullable Input<Boolean> ne() {
    return this.ne;
  }
  
  public @Nullable Input<Boolean> eq() {
    return this.eq;
  }
  
  public ModelBooleanFilterInput(Input<Boolean> ne, Input<Boolean> eq) {
    this.ne = ne;
    this.eq = eq;
  }
  
  public static Builder builder() {
    return new Builder();
  }
  @Override
  public InputFieldMarshaller marshaller() {
    return new InputFieldMarshaller() {
      @Override
      public void marshal(InputFieldWriter writer) throws IOException {
        if(ne.defined) {
            writer.writeBoolean("ne", ne.value);
        }
        if(eq.defined) {
            writer.writeBoolean("eq", eq.value);
        }
      }
    };
  }

  public static final class Builder {
    private Input<Boolean> ne = Input.absent();
    private Input<Boolean> eq = Input.absent();
  
    Builder() {}
    
    public Builder ne(@Nullable Boolean ne) {
      this.ne = Input.fromNullable(ne);
      return this;
    }
    
    public Builder eq(@Nullable Boolean eq) {
      this.eq = Input.fromNullable(eq);
      return this;
    }
  
    public ModelBooleanFilterInput build() {
    
      return new ModelBooleanFilterInput(ne, eq);
    }
  }
  
}
