package com.app.generated.graphql;

import java.util.Arrays;
import com.apollographql.apollo.api.GraphqlFragment;
import java.util.List;
import java.lang.String;
import java.util.Collections;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.ResponseFieldMapper;
import com.apollographql.apollo.api.ResponseField;
import javax.annotation.Nonnull;
import type.CustomType;
import javax.annotation.Nullable;
import com.apollographql.apollo.api.internal.Utils;
import com.apollographql.apollo.api.ResponseReader;
import com.apollographql.apollo.api.ResponseFieldMarshaller;
import com.apollographql.apollo.api.ResponseWriter;

public class NodeFields implements GraphqlFragment {
  private final @Nonnull String __typename;
  private final @Nonnull String id;
  private final @Nullable Test test;
  private volatile String $toString;
  private volatile int $hashCode;
  private volatile boolean $hashCodeMemoized;
  static final ResponseField[] $responseFields = {
      ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
      ResponseField.forCustomType("id", "id", null, false, CustomType.ID, Collections.<ResponseField.Condition>emptyList()),
      ResponseField.forObject("test", "test", null, true, Collections.<ResponseField.Condition>emptyList())
    };
  public static final String FRAGMENT_DEFINITION = "fragment NodeFields on Node {   id   test {     foo     bar   } }";
  public static final List<String> POSSIBLE_TYPES = Collections.unmodifiableList(Arrays.asList("A", "B"));
  public NodeFields(@Nonnull String __typename, @Nonnull String id, @Nullable Test test) {
    this.__typename = Utils.checkNotNull(__typename, "__typename == null");
    this.id = Utils.checkNotNull(id, "id == null");
    this.test = test;
  }
  
  public @Nonnull String __typename() {
    return this.__typename;
  }
  
  public @Nonnull String id() {
    return this.id;
  }
  
  public @Nullable Test test() {
    return this.test;
  }
  
  @Override
   public String toString() {
    if ($toString == null) {
      $toString = "NodeFields{"
        + "__typename=" + __typename + ", "
        + "id=" + id + ", "
        + "test=" + test + ", "
        + "}";
    }
    
    return $toString;
  }
  
  @Override
   public boolean equals(Object o) {
    if (o == this) {
      return true;
    }
    if (o instanceof NodeFields) {
      NodeFields that = (NodeFields) o;
      return this.__typename.equals(that.__typename) && this.id.equals(that.id) && ((this.test == null) ? (that.test == null) : this.test.equals(that.test));
    }
    
    return false;
  }
  
  @Override
   public int hashCode() {
    if (!$hashCodeMemoized) {
      int h = 1;
      h *= 1000003;
      h ^= __typename.hashCode();
      h *= 1000003;
      h ^= id.hashCode();
      h *= 1000003;
      h ^= (test == null) ? 0 : test.hashCode();
      $hashCode = h;
      $hashCodeMemoized = true;
    }
    
    return $hashCode;
  }
  
  public ResponseFieldMarshaller marshaller() {
    return new ResponseFieldMarshaller() {
      @Override
      public void marshal(ResponseWriter writer) {
        writer.writeString($responseFields[0], __typename);
        writer.writeCustom((ResponseField.CustomTypeField) $responseFields[1], id);
        writer.writeObject($responseFields[2], test != null ? test.marshaller() : null);
      }
    };
  }
  public static final class Mapper implements ResponseFieldMapper<NodeFields> {
    private final Test.Mapper testFieldMapper = new Test.Mapper();
    @Override
     public NodeFields map(ResponseReader reader) {
      final String __typename = reader.readString($responseFields[0]);
      final String id = reader.readCustomType((ResponseField.CustomTypeField) $responseFields[1]);
      final Test test = reader.readObject($responseFields[2], new ResponseReader.ObjectReader<Test>() {
                @Override
                public Test read(ResponseReader reader) {
                  return testFieldMapper.map(reader);
                }
              });
      return new NodeFields(__typename, id, test);
    }
  }
  

  public static class Test {
    private final @Nonnull String __typename;
    private final @Nullable String foo;
    private final @Nullable String bar;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("foo", "foo", null, true, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("bar", "bar", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public Test(@Nonnull String __typename, @Nullable String foo, @Nullable String bar) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.foo = foo;
      this.bar = bar;
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nullable String foo() {
      return this.foo;
    }
    
    public @Nullable String bar() {
      return this.bar;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Test{"
          + "__typename=" + __typename + ", "
          + "foo=" + foo + ", "
          + "bar=" + bar + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals(Object o) {
      if (o == this) {
        return true;
      }
      if (o instanceof Test) {
        Test that = (Test) o;
        return this.__typename.equals(that.__typename) && ((this.foo == null) ? (that.foo == null) : this.foo.equals(that.foo)) && ((this.bar == null) ? (that.bar == null) : this.bar.equals(that.bar));
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= __typename.hashCode();
        h *= 1000003;
        h ^= (foo == null) ? 0 : foo.hashCode();
        h *= 1000003;
        h ^= (bar == null) ? 0 : bar.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeString($responseFields[0], __typename);
          writer.writeString($responseFields[1], foo != null ? foo : null);
          writer.writeString($responseFields[2], bar != null ? bar : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<Test> {
      @Override
       public Test map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final String foo = reader.readString($responseFields[1]);
        final String bar = reader.readString($responseFields[2]);
        return new Test(__typename, foo, bar);
      }
    }
    
  }
  
}
