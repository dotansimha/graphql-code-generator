package com.app.generated.graphql;

import com.apollographql.apollo.api.Query;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.Operation;
import com.apollographql.apollo.api.ResponseFieldMapper;
import com.apollographql.apollo.api.ResponseField;
import javax.annotation.Nonnull;
import fragment.NodeFields;
import javax.annotation.Nullable;
import java.util.Collections;
import com.apollographql.apollo.api.internal.Utils;
import com.apollographql.apollo.api.ResponseReader;
import com.apollographql.apollo.api.ResponseFieldMarshaller;
import com.apollographql.apollo.api.ResponseWriter;
import com.apollographql.apollo.api.internal.UnmodifiableMapBuilder;
import java.lang.Object;
import java.util.LinkedHashMap;
import java.util.Map;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.InputFieldWriter;
import java.io.IOException;

@Generated("Apollo GraphQL")
public final class SearchTestQuery implements Query<SearchTestQuery.Data, SearchTestQuery.Data, Operation.Variables> {
  public static final String OPERATION_DEFINITION = "query SearchTest {   test: searchOne(term: \"1\") {     ...NodeFields     ... on B {       b     }     ... on A {       a     }   } }";
  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;
  public static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "SearchTest";
    }
  };
  private final Operation.Variables variables;
  @Override
   public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
   public SearchTestQuery.Data wrapData(SearchTestQuery.Data data) {
    return data;
  }
  
  @Override
   public Operation.Variables variables() {
    return variables;
  }
  
  @Override
   public ResponseFieldMapper<SearchTestQuery.Data> responseFieldMapper() {
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
    return "697d863c86899ff67d7b90e7d9dcc031";
  }
  
  public SearchTestQuery() {
    this.variables = Operation.EMPTY_VARIABLES;
  }
  public static class Data implements Operation.Data {
    private final @Nonnull SearchOne searchOne;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forObject("test", "searchOne", new UnmodifiableMapBuilder<String, Object>(1).put("term", "1").build(), false, Collections.<ResponseField.Condition>emptyList())
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
    private final @Nullable AsB asB;
    private final @Nullable AsA asA;
    private final @Nonnull Fragments fragments;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forInlineFragment("__typename", "__typename", Arrays.asList("B")),
        ResponseField.forInlineFragment("__typename", "__typename", Arrays.asList("A")),
        ResponseField.forFragment("__typename", "__typename", Arrays.asList("Node"))
      };
    public SearchOne(@Nonnull String __typename, @Nullable AsB asB, @Nullable AsA asA, @Nonnull Fragments fragments) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.asB = asB;
      this.asA = asA;
      this.fragments = Utils.checkNotNull(fragments, "fragments == null");
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nullable AsB asB() {
      return this.asB;
    }
    
    public @Nullable AsA asA() {
      return this.asA;
    }
    
    public @Nonnull Fragments fragments() {
      return this.fragments;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "SearchOne{"
          + "__typename=" + __typename + ", "
          + "asB=" + asB + ", "
          + "asA=" + asA + ", "
          + "fragments=" + fragments + ", "
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
        return this.__typename.equals(that.__typename) && ((this.asB == null) ? (that.asB == null) : this.asB.equals(that.asB)) && ((this.asA == null) ? (that.asA == null) : this.asA.equals(that.asA)) && this.fragments.equals(that.fragments);
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
        h ^= (asB == null) ? 0 : asB.hashCode();
        h *= 1000003;
        h ^= (asA == null) ? 0 : asA.hashCode();
        h *= 1000003;
        h ^= fragments.hashCode();
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
          writer.writeObject($responseFields[1], asB != null ? asB.marshaller() : null);
          writer.writeObject($responseFields[2], asA != null ? asA.marshaller() : null);
          writer.writeObject($responseFields[3], fragments != null ? fragments.marshaller() : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<SearchOne> {
      private final AsB.Mapper asBFieldMapper = new AsB.Mapper();
      private final AsA.Mapper asAFieldMapper = new AsA.Mapper();
      private final Fragments.Mapper fragmentsFieldMapper = new Fragments.Mapper();
      @Override
       public SearchOne map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final AsB asB = reader.readObject($responseFields[1], new ResponseReader.ObjectReader<AsB>() {
                  @Override
                  public AsB read(ResponseReader reader) {
                    return asBFieldMapper.map(reader);
                  }
                });
        final AsA asA = reader.readObject($responseFields[2], new ResponseReader.ObjectReader<AsA>() {
                  @Override
                  public AsA read(ResponseReader reader) {
                    return asAFieldMapper.map(reader);
                  }
                });
        final Fragments fragments = reader.readObject($responseFields[3], new ResponseReader.ObjectReader<Fragments>() {
                  @Override
                  public Fragments read(ResponseReader reader) {
                    return fragmentsFieldMapper.map(reader);
                  }
                });
        return new SearchOne(__typename, asB, asA, fragments);
      }
    }
    
  }
  

  public static class AsB {
    private final @Nonnull String __typename;
    private final @Nullable String b;
    private final @Nonnull Fragments fragments;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("b", "b", null, true, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forFragment("__typename", "__typename", Arrays.asList("Node"))
      };
    public AsB(@Nonnull String __typename, @Nullable String b, @Nonnull Fragments fragments) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.b = b;
      this.fragments = Utils.checkNotNull(fragments, "fragments == null");
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nullable String b() {
      return this.b;
    }
    
    public @Nonnull Fragments fragments() {
      return this.fragments;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "AsB{"
          + "__typename=" + __typename + ", "
          + "b=" + b + ", "
          + "fragments=" + fragments + ", "
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
        return this.__typename.equals(that.__typename) && ((this.b == null) ? (that.b == null) : this.b.equals(that.b)) && this.fragments.equals(that.fragments);
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
        h ^= (b == null) ? 0 : b.hashCode();
        h *= 1000003;
        h ^= fragments.hashCode();
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
          writer.writeString($responseFields[1], b != null ? b : null);
          writer.writeObject($responseFields[2], fragments != null ? fragments.marshaller() : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<AsB> {
      private final Fragments.Mapper fragmentsFieldMapper = new Fragments.Mapper();
      @Override
       public AsB map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final String b = reader.readString($responseFields[1]);
        final Fragments fragments = reader.readObject($responseFields[2], new ResponseReader.ObjectReader<Fragments>() {
                  @Override
                  public Fragments read(ResponseReader reader) {
                    return fragmentsFieldMapper.map(reader);
                  }
                });
        return new AsB(__typename, b, fragments);
      }
    }
    
  }
  

  public static class AsA {
    private final @Nonnull String __typename;
    private final @Nullable String a;
    private final @Nonnull Fragments fragments;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("a", "a", null, true, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forFragment("__typename", "__typename", Arrays.asList("Node"))
      };
    public AsA(@Nonnull String __typename, @Nullable String a, @Nonnull Fragments fragments) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.a = a;
      this.fragments = Utils.checkNotNull(fragments, "fragments == null");
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nullable String a() {
      return this.a;
    }
    
    public @Nonnull Fragments fragments() {
      return this.fragments;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "AsA{"
          + "__typename=" + __typename + ", "
          + "a=" + a + ", "
          + "fragments=" + fragments + ", "
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
        return this.__typename.equals(that.__typename) && ((this.a == null) ? (that.a == null) : this.a.equals(that.a)) && this.fragments.equals(that.fragments);
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
        h ^= (a == null) ? 0 : a.hashCode();
        h *= 1000003;
        h ^= fragments.hashCode();
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
          writer.writeString($responseFields[1], a != null ? a : null);
          writer.writeObject($responseFields[2], fragments != null ? fragments.marshaller() : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<AsA> {
      private final Fragments.Mapper fragmentsFieldMapper = new Fragments.Mapper();
      @Override
       public AsA map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final String a = reader.readString($responseFields[1]);
        final Fragments fragments = reader.readObject($responseFields[2], new ResponseReader.ObjectReader<Fragments>() {
                  @Override
                  public Fragments read(ResponseReader reader) {
                    return fragmentsFieldMapper.map(reader);
                  }
                });
        return new AsA(__typename, a, fragments);
      }
    }
    
  }
  

  public static final class Builder {
    Builder() {
      
    }
    
    public SearchTestQuery build() {
      return new SearchTestQuery();
    }
  }
  

  public static final class Variables extends Operation.Variables {
    private final transient Map<String, Object> valueMap = new LinkedHashMap<>();
    public Variables() {
      
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
      
        }
      };
    }
  }
  
}
