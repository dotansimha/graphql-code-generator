package .Users.dotansimha.Dev.graphql-code-generator.dev-test.apollo-android;

import com.apollographql.apollo.api.InputType;
import javax.annotation.Generated;
import com.apollographql.apollo.api.Input;
import java.lang.Float;
import java.util.List;
import javax.annotation.Nullable;
import java.lang.Override;
import java.io.IOException;
import com.apollographql.apollo.api.InputFieldWriter;
import com.apollographql.apollo.api.InputFieldMarshaller;

@Generated("Apollo GraphQL")
public final class ModelFloatFilterInput implements InputType {
  private final Input<Float> ne;
  private final Input<Float> eq;
  private final Input<Float> le;
  private final Input<Float> lt;
  private final Input<Float> ge;
  private final Input<Float> gt;
  private final Input<Float> contains;
  private final Input<Float> notContains;
  private final Input<List<Float>> between;

  ModelFloatFilterInput(Input<Float> ne, Input<Float> eq, Input<Float> le, Input<Float> lt, Input<Float> ge, Input<Float> gt, Input<Float> contains, Input<Float> notContains, Input<List<Float>> between) {
    this.ne = ne;
    this.eq = eq;
    this.le = le;
    this.lt = lt;
    this.ge = ge;
    this.gt = gt;
    this.contains = contains;
    this.notContains = notContains;
    this.between = between;
  }

  public @Nullable Input<Float> ne() { return this.ne; }
  public @Nullable Input<Float> eq() { return this.eq; }
  public @Nullable Input<Float> le() { return this.le; }
  public @Nullable Input<Float> lt() { return this.lt; }
  public @Nullable Input<Float> ge() { return this.ge; }
  public @Nullable Input<Float> gt() { return this.gt; }
  public @Nullable Input<Float> contains() { return this.contains; }
  public @Nullable Input<Float> notContains() { return this.notContains; }
  public @Nullable Input<List<Float>> between() { return this.between; }

  public static Builder builder() { return new Builder(); }

  @Override
  public InputFieldMarshaller marshaller() {
    return new InputFieldMarshaller() {
      @Override
      public void marshal(InputFieldWriter writer) throws IOException {
        if(ne.defined) {
            writer.writeDouble("ne", ne.value);
        }
        if(eq.defined) {
            writer.writeDouble("eq", eq.value);
        }
        if(le.defined) {
            writer.writeDouble("le", le.value);
        }
        if(lt.defined) {
            writer.writeDouble("lt", lt.value);
        }
        if(ge.defined) {
            writer.writeDouble("ge", ge.value);
        }
        if(gt.defined) {
            writer.writeDouble("gt", gt.value);
        }
        if(contains.defined) {
            writer.writeDouble("contains", contains.value);
        }
        if(notContains.defined) {
            writer.writeDouble("notContains", notContains.value);
        }
        if(between.defined) {
          writer.writeList("between", between.value != null ? new InputFieldWriter.ListWriter() {
            @Override
            public void write(InputFieldWriter.ListItemWriter listItemWriter) throws IOException {
              for (Float $item : between.value) {
                listItemWriter.writeDouble($item);
              }
            }
          } : null);
        }
      }
    };
  }

  public static final class Builder {
    private Input<Float> ne = Input.absent();
    private Input<Float> eq = Input.absent();
    private Input<Float> le = Input.absent();
    private Input<Float> lt = Input.absent();
    private Input<Float> ge = Input.absent();
    private Input<Float> gt = Input.absent();
    private Input<Float> contains = Input.absent();
    private Input<Float> notContains = Input.absent();
    private Input<List<Float>> between = Input.absent();
  
    Builder() {}
    
    public Builder ne(@Nullable Float ne) {
      this.ne = Input.fromNullable(ne);
      return this;
    }
    
    public Builder eq(@Nullable Float eq) {
      this.eq = Input.fromNullable(eq);
      return this;
    }
    
    public Builder le(@Nullable Float le) {
      this.le = Input.fromNullable(le);
      return this;
    }
    
    public Builder lt(@Nullable Float lt) {
      this.lt = Input.fromNullable(lt);
      return this;
    }
    
    public Builder ge(@Nullable Float ge) {
      this.ge = Input.fromNullable(ge);
      return this;
    }
    
    public Builder gt(@Nullable Float gt) {
      this.gt = Input.fromNullable(gt);
      return this;
    }
    
    public Builder contains(@Nullable Float contains) {
      this.contains = Input.fromNullable(contains);
      return this;
    }
    
    public Builder notContains(@Nullable Float notContains) {
      this.notContains = Input.fromNullable(notContains);
      return this;
    }
    
    public Builder between(@Nullable List<Float> between) {
      this.between = Input.fromNullable(between);
      return this;
    }
  
    public ModelFloatFilterInput build() {
    
      return new ModelFloatFilterInput(ne, eq, le, lt, ge, gt, contains, notContains, between);
    }
  }
  
}
