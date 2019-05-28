package type;

import com.apollographql.apollo.api.InputType;
import javax.annotation.Generated;
import com.apollographql.apollo.api.Input;
import java.lang.Integer;
import javax.annotation.Nullable;
import java.lang.Override;
import java.io.IOException;
import com.apollographql.apollo.api.InputFieldWriter;
import com.apollographql.apollo.api.InputFieldMarshaller;

@Generated("Apollo GraphQL")
public final class ModelIntFilterInput implements InputType {
  private final Input<Integer> ne;
  private final Input<Integer> eq;
  private final Input<Integer> le;
  private final Input<Integer> lt;
  private final Input<Integer> ge;
  private final Input<Integer> gt;
  private final Input<Integer> contains;
  private final Input<Integer> notContains;
  private final Input<Integer> between;

  ModelIntFilterInput(Input<Integer> ne, Input<Integer> eq, Input<Integer> le, Input<Integer> lt, Input<Integer> ge, Input<Integer> gt, Input<Integer> contains, Input<Integer> notContains, Input<Integer> between) {
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

  public @Nullable Input<Integer> ne() { return this.ne; }
  public @Nullable Input<Integer> eq() { return this.eq; }
  public @Nullable Input<Integer> le() { return this.le; }
  public @Nullable Input<Integer> lt() { return this.lt; }
  public @Nullable Input<Integer> ge() { return this.ge; }
  public @Nullable Input<Integer> gt() { return this.gt; }
  public @Nullable Input<Integer> contains() { return this.contains; }
  public @Nullable Input<Integer> notContains() { return this.notContains; }
  public @Nullable Input<Integer> between() { return this.between; }

  public static Builder builder() { return new Builder(); }

  @Override
  public InputFieldMarshaller marshaller() {
    return new InputFieldMarshaller() {
      @Override
      public void marshal(InputFieldWriter writer) throws IOException {
        if(ne.defined) {
            writer.writeInt("ne", ne.value);
        }
        if(eq.defined) {
            writer.writeInt("eq", eq.value);
        }
        if(le.defined) {
            writer.writeInt("le", le.value);
        }
        if(lt.defined) {
            writer.writeInt("lt", lt.value);
        }
        if(ge.defined) {
            writer.writeInt("ge", ge.value);
        }
        if(gt.defined) {
            writer.writeInt("gt", gt.value);
        }
        if(contains.defined) {
            writer.writeInt("contains", contains.value);
        }
        if(notContains.defined) {
            writer.writeInt("notContains", notContains.value);
        }
        if(between.defined) {
          writer.writeList("between", between.value != null ? new InputFieldWriter.ListWriter() {
            @Override
            public void write(InputFieldWriter.ListItemWriter listItemWriter) throws IOException {
              for (Integer $item : between.value) {
                listItemWriter.writeInt($item);
              }
            }
          } : null);
        }
      }
    };
  }

  public static final class Builder {
    private Input<Integer> ne = Input.absent();
    private Input<Integer> eq = Input.absent();
    private Input<Integer> le = Input.absent();
    private Input<Integer> lt = Input.absent();
    private Input<Integer> ge = Input.absent();
    private Input<Integer> gt = Input.absent();
    private Input<Integer> contains = Input.absent();
    private Input<Integer> notContains = Input.absent();
    private Input<Integer> between = Input.absent();
  
    Builder() {}
    
    public Builder ne(@Nullable Integer ne) {
      this.ne = Input.fromNullable(ne);
      return this;
    }
    
    public Builder eq(@Nullable Integer eq) {
      this.eq = Input.fromNullable(eq);
      return this;
    }
    
    public Builder le(@Nullable Integer le) {
      this.le = Input.fromNullable(le);
      return this;
    }
    
    public Builder lt(@Nullable Integer lt) {
      this.lt = Input.fromNullable(lt);
      return this;
    }
    
    public Builder ge(@Nullable Integer ge) {
      this.ge = Input.fromNullable(ge);
      return this;
    }
    
    public Builder gt(@Nullable Integer gt) {
      this.gt = Input.fromNullable(gt);
      return this;
    }
    
    public Builder contains(@Nullable Integer contains) {
      this.contains = Input.fromNullable(contains);
      return this;
    }
    
    public Builder notContains(@Nullable Integer notContains) {
      this.notContains = Input.fromNullable(notContains);
      return this;
    }
    
    public Builder between(@Nullable Integer between) {
      this.between = Input.fromNullable(between);
      return this;
    }
  
    public ModelIntFilterInput build() {
    
      return new ModelIntFilterInput(ne, eq, le, lt, ge, gt, contains, notContains, between);
    }
  }
  
}
