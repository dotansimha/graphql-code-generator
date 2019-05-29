package com.app.generated.graphql;

import com.apollographql.apollo.api.Query;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.Operation;
import com.apollographql.apollo.api.ResponseFieldMapper;
import com.apollographql.apollo.api.internal.Utils;
import com.apollographql.apollo.api.ResponseField;
import javax.annotation.Nonnull;
import java.util.Collections;
import type.CustomType;
import javax.annotation.Nullable;
import com.apollographql.apollo.api.ResponseReader;
import com.apollographql.apollo.api.ResponseFieldMarshaller;
import com.apollographql.apollo.api.ResponseWriter;
import java.lang.Long;
import com.apollographql.apollo.api.internal.UnmodifiableMapBuilder;
import java.lang.Object;
import java.util.LinkedHashMap;
import java.util.Map;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.InputFieldWriter;
import java.io.IOException;

@Generated("Apollo GraphQL")
public final class SearchOneQuery implements Query<SearchOneQuery.Data, SearchOneQuery.Data, SearchOneQuery.Variables> {
  public static final String OPERATION_DEFINITION = "query SearchOne($term: String!) {   searchOne(term: $term) {     id     test {       foo       bar     }     ... on A {       a       t     }     ... on B {       b     }   } }";
  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;
  public static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "SearchOne";
    }
  };
  private final SearchOneQuery.Variables variables;
  @Override
   public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
   public SearchOneQuery.Data wrapData(SearchOneQuery.Data data) {
    return data;
  }
  
  @Override
   public SearchOneQuery.Variables variables() {
    return variables;
  }
  
  @Override
   public ResponseFieldMapper<SearchOneQuery.Data> responseFieldMapper() {
    return new Data.Mapper();
  }
  
  public static Builder builder() {
    return new Builder();
  }
  
  @Override
   public OperationName name() {
    return OPERATION_NAME;
  }
  
  public String operationId() {
    return "3bba9d07b30e1ffcb66df2a17822b612";
  }
  
  public SearchOneQuery(String term) {
    Utils.checkNotNull(term, "term == null");
    this.variables = new SearchOneQuery.Variables(term);
  }
  public static class Data implements Operation.Data {
    private final @Nonnull SearchOne searchOne;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forObject("searchOne", "searchOne", new UnmodifiableMapBuilder<String, Object>(1).put("term", new UnmodifiableMapBuilder<String, Object>(2).put("kind", "Variable").put("variableName", "term").build()).build(), false, Collections.<ResponseField.Condition>emptyList())
      };
    public Data(@Nonnull SearchOne searchOne) {
      this.searchOne = Utils.checkNotNull(searchOne, "searchOne == null");
    }
    
    public @Nonnull SearchOne searchOne() {
      return this.searchOne;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Data{"
          + "searchOne=" + searchOne + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals(Object o) {
      if (o == this) {
        return true;
      }
      if (o instanceof Data) {
        Data that = (Data) o;
        return this.searchOne.equals(that.searchOne);
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= searchOne.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeObject($responseFields[0], searchOne != null ? searchOne.marshaller() : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<Data> {
      private final SearchOne.Mapper searchOneFieldMapper = new SearchOne.Mapper();
      @Override
       public Data map(ResponseReader reader) {
        final SearchOne searchOne = reader.readObject($responseFields[0], new ResponseReader.ObjectReader<SearchOne>() {
                  @Override
                  public SearchOne read(ResponseReader reader) {
                    return searchOneFieldMapper.map(reader);
                  }
                });
        return new Data(searchOne);
      }
    }
    
  }
  

  public static class SearchOne {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nullable Test test;
    private final @Nullable AsA asA;
    private final @Nullable AsB asB;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forCustomType("id", "id", null, false, CustomType.ID, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forObject("test", "test", null, true, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forInlineFragment("__typename", "__typename", Arrays.asList("A")),
        ResponseField.forInlineFragment("__typename", "__typename", Arrays.asList("B"))
      };
    public SearchOne(@Nonnull String __typename, @Nonnull String id, @Nullable Test test, @Nullable AsA asA, @Nullable AsB asB) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.id = Utils.checkNotNull(id, "id == null");
      this.test = test;
      this.asA = asA;
      this.asB = asB;
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
    
    public @Nullable AsA asA() {
      return this.asA;
    }
    
    public @Nullable AsB asB() {
      return this.asB;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "SearchOne{"
          + "__typename=" + __typename + ", "
          + "id=" + id + ", "
          + "test=" + test + ", "
          + "asA=" + asA + ", "
          + "asB=" + asB + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals(Object o) {
      if (o == this) {
        return true;
      }
      if (o instanceof SearchOne) {
        SearchOne that = (SearchOne) o;
        return this.__typename.equals(that.__typename) && this.id.equals(that.id) && ((this.test == null) ? (that.test == null) : this.test.equals(that.test)) && ((this.asA == null) ? (that.asA == null) : this.asA.equals(that.asA)) && ((this.asB == null) ? (that.asB == null) : this.asB.equals(that.asB));
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
        h *= 1000003;
        h ^= (asA == null) ? 0 : asA.hashCode();
        h *= 1000003;
        h ^= (asB == null) ? 0 : asB.hashCode();
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
          writer.writeObject($responseFields[3], asA != null ? asA.marshaller() : null);
          writer.writeObject($responseFields[4], asB != null ? asB.marshaller() : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<SearchOne> {
      private final Test.Mapper testFieldMapper = new Test.Mapper();
      private final AsA.Mapper asAFieldMapper = new AsA.Mapper();
      private final AsB.Mapper asBFieldMapper = new AsB.Mapper();
      @Override
       public SearchOne map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final String id = reader.readCustomType((ResponseField.CustomTypeField) $responseFields[1]);
        final Test test = reader.readObject($responseFields[2], new ResponseReader.ObjectReader<Test>() {
                  @Override
                  public Test read(ResponseReader reader) {
                    return testFieldMapper.map(reader);
                  }
                });
        final AsA asA = reader.readObject($responseFields[3], new ResponseReader.ObjectReader<AsA>() {
                  @Override
                  public AsA read(ResponseReader reader) {
                    return asAFieldMapper.map(reader);
                  }
                });
        final AsB asB = reader.readObject($responseFields[4], new ResponseReader.ObjectReader<AsB>() {
                  @Override
                  public AsB read(ResponseReader reader) {
                    return asBFieldMapper.map(reader);
                  }
                });
        return new SearchOne(__typename, id, test, asA, asB);
      }
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
  

  public static class AsA {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nullable Test test;
    private final @Nullable String a;
    private final @Nullable Long t;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("a", "a", null, true, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forCustomType("t", "t", null, true, CustomType.AWSDate, Collections.<ResponseField.Condition>emptyList())
      };
    public AsA(@Nonnull String __typename, @Nonnull String id, @Nullable Test test, @Nullable String a, @Nullable Long t) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.id = Utils.checkNotNull(id, "id == null");
      this.test = test;
      this.a = a;
      this.t = t;
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
    
    public @Nullable String a() {
      return this.a;
    }
    
    public @Nullable Long t() {
      return this.t;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "AsA{"
          + "__typename=" + __typename + ", "
          + "id=" + id + ", "
          + "test=" + test + ", "
          + "a=" + a + ", "
          + "t=" + t + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals(Object o) {
      if (o == this) {
        return true;
      }
      if (o instanceof AsA) {
        AsA that = (AsA) o;
        return this.__typename.equals(that.__typename) && this.id.equals(that.id) && ((this.test == null) ? (that.test == null) : this.test.equals(that.test)) && ((this.a == null) ? (that.a == null) : this.a.equals(that.a)) && ((this.t == null) ? (that.t == null) : this.t.equals(that.t));
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
        h *= 1000003;
        h ^= (a == null) ? 0 : a.hashCode();
        h *= 1000003;
        h ^= (t == null) ? 0 : t.hashCode();
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
          writer.writeString($responseFields[3], a != null ? a : null);
          writer.writeCustom((ResponseField.CustomTypeField) $responseFields[4], t != null ? t : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<AsA> {
      private final Test.Mapper testFieldMapper = new Test.Mapper();
      @Override
       public AsA map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final String id = reader.readCustomType((ResponseField.CustomTypeField) $responseFields[1]);
        final Test test = reader.readObject($responseFields[2], new ResponseReader.ObjectReader<Test>() {
                  @Override
                  public Test read(ResponseReader reader) {
                    return testFieldMapper.map(reader);
                  }
                });
        final String a = reader.readString($responseFields[3]);
        final Long t = reader.readCustomType((ResponseField.CustomTypeField) $responseFields[4]);
        return new AsA(__typename, id, test, a, t);
      }
    }
    
  }
  

  public static class AsB {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nullable Test test;
    private final @Nullable String b;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("b", "b", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public AsB(@Nonnull String __typename, @Nonnull String id, @Nullable Test test, @Nullable String b) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.id = Utils.checkNotNull(id, "id == null");
      this.test = test;
      this.b = b;
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
    
    public @Nullable String b() {
      return this.b;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "AsB{"
          + "__typename=" + __typename + ", "
          + "id=" + id + ", "
          + "test=" + test + ", "
          + "b=" + b + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals(Object o) {
      if (o == this) {
        return true;
      }
      if (o instanceof AsB) {
        AsB that = (AsB) o;
        return this.__typename.equals(that.__typename) && this.id.equals(that.id) && ((this.test == null) ? (that.test == null) : this.test.equals(that.test)) && ((this.b == null) ? (that.b == null) : this.b.equals(that.b));
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
        h *= 1000003;
        h ^= (b == null) ? 0 : b.hashCode();
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
          writer.writeString($responseFields[3], b != null ? b : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<AsB> {
      private final Test.Mapper testFieldMapper = new Test.Mapper();
      @Override
       public AsB map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final String id = reader.readCustomType((ResponseField.CustomTypeField) $responseFields[1]);
        final Test test = reader.readObject($responseFields[2], new ResponseReader.ObjectReader<Test>() {
                  @Override
                  public Test read(ResponseReader reader) {
                    return testFieldMapper.map(reader);
                  }
                });
        final String b = reader.readString($responseFields[3]);
        return new AsB(__typename, id, test, b);
      }
    }
    
  }
  

  public static final class Builder {
    private @Nullable String term;
    Builder() {
      
    }
    
    public Builder term(@Nullable String term) {
      this.term = term;
      return this;
    }
    
    public SearchOneQuery build() {
      return new SearchOneQuery(term);
    }
  }
  

  public static final class Variables extends Operation.Variables {
    private @Nonnull String term;
    private final transient Map<String, Object> valueMap = new LinkedHashMap<>();
    public String term() {
      return term;
    }
    
    public Variables(@Nonnull String term) {
      this.term = term;
      this.valueMap.put("term", term);
    }
    
    @Override
     public Map<String, Object> valueMap() {
      return Collections.unmodifiableMap(valueMap);
    }
    
    @Override
     public InputFieldMarshaller marshaller() {
      return new InputFieldMarshaller() {
        @Override
        public void marshal(InputFieldWriter writer) throws IOException {
          writer.writeString("term", term);
        }
      };
    }
  }
  
}

