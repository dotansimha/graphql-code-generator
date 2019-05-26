package com.app.generated.graphql;

import com.apollographql.apollo.api.Query;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.ResponseFieldMapper;
import com.apollographql.apollo.api.Input;
import javax.annotation.Nonnull;
import com.apollographql.apollo.api.internal.Utils;
import com.apollographql.apollo.api.ResponseField;
import java.util.Collections;
import com.apollographql.apollo.api.ResponseReader;
import com.apollographql.apollo.api.ResponseFieldMarshaller;
import com.apollographql.apollo.api.ResponseWriter;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.InputFieldWriter;
import java.io.IOException;

@Generated("Apollo GraphQL")
public final class SearchQuery implements Query<SearchQuery.Data, SearchQuery.Data, SearchQuery.Variables> {
  public static final String OPERATION_DEFINITION = "query Search($term: String!) {   search(term: $term) {     id     ... on A {       a     }     ... on B {       b     }   } }";
  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;
  public static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "Search";
    }
  };
  private final SearchQuery.Variables variables;
  @Override
   public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
   public SearchQuery.Data wrapData(SearchQuery.Data data) {
    return data;
  }
  
  @Override
   public SearchQuery.Variables variables() {
    return variables;
  }
  
  @Override
   public ResponseFieldMapper<SearchQuery.Data> responseFieldMapper() {
    return new Data.Mapper();
  }
  
  public static Builder builder() {
    new Builder();
  }
  
  @Override
   public OperationName name() {
    return OPERATION_NAME;
  }
  
  public String operationId() {
    return "cc5de466b97c73fce5c80c4cb12de3bf";
    }
  }
  public static class Data implements Operation.Data {
    private final @Nonnull Search search;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forObject("search", "search", null, false, Collections.<ResponseField.Condition>emptyList())
      };
    public Data(@Nonnull Search search) {
      this.search = Utils.checkNotNull(search, "search == null");
    }
    
    public @Nonnull Search search() {
      return this.search;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Data{"
          + "search=" + search + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals() {
      if (o == this) {
        return true;
      }
      if (o instanceof Data) {
        Data that = (Data) o;
        return this.search.equals(that.search);
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= search.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeObject($responseFields[0], search);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<Data> {
      @Override
       public Data map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static class Search {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nullable AsA asA;
    private final @Nullable AsB asB;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forCustomType("id", "id", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forInlineFragment("__typename", "__typename", Arrays.asList("A")),
        ResponseField.forInlineFragment("__typename", "__typename", Arrays.asList("B"))
      };
    public Search(@Nonnull String __typename, @Nonnull String id, @Nullable AsA asA, @Nullable AsB asB) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.id = Utils.checkNotNull(id, "id == null");
      this.asA = asA;
      this.asB = asB;
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nonnull String id() {
      return this.id;
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
        $toString = "Search{"
          + "__typename=" + __typename + ", "
          + "id=" + id + ", "
          + "asA=" + asA + ", "
          + "asB=" + asB + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals() {
      if (o == this) {
        return true;
      }
      if (o instanceof Search) {
        Search that = (Search) o;
        return this.__typename.equals(that.__typename) && this.id.equals(that.id) && ((this.asA == null) ? (that.asA == null) : this.asA.equals(that.asA)) && ((this.asB == null) ? (that.asB == null) : this.asB.equals(that.asB));
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
          writer.writeString($responseFields[1], id);
          writer.writeObject($responseFields[2], asA);
          writer.writeObject($responseFields[3], asB);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<Search> {
      @Override
       public Search map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static class AsA {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nullable String a;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("a", "a", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public AsA(@Nonnull String __typename, @Nonnull String id, @Nullable String a) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.id = Utils.checkNotNull(id, "id == null");
      this.a = a;
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nonnull String id() {
      return this.id;
    }
    
    public @Nullable String a() {
      return this.a;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "AsA{"
          + "__typename=" + __typename + ", "
          + "id=" + id + ", "
          + "a=" + a + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals() {
      if (o == this) {
        return true;
      }
      if (o instanceof AsA) {
        AsA that = (AsA) o;
        return this.__typename.equals(that.__typename) && this.id.equals(that.id) && ((this.a == null) ? (that.a == null) : this.a.equals(that.a));
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
        h ^= (a == null) ? 0 : a.hashCode();
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
          writer.writeString($responseFields[1], id);
          writer.writeString($responseFields[2], a);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<AsA> {
      @Override
       public AsA map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static class AsB {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nullable String b;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("b", "b", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public AsB(@Nonnull String __typename, @Nonnull String id, @Nullable String b) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.id = Utils.checkNotNull(id, "id == null");
      this.b = b;
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nonnull String id() {
      return this.id;
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
          + "b=" + b + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals() {
      if (o == this) {
        return true;
      }
      if (o instanceof AsB) {
        AsB that = (AsB) o;
        return this.__typename.equals(that.__typename) && this.id.equals(that.id) && ((this.b == null) ? (that.b == null) : this.b.equals(that.b));
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
          writer.writeString($responseFields[1], id);
          writer.writeString($responseFields[2], b);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<AsB> {
      @Override
       public AsB map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static final class Builder {
    private @Nonnull String term;
    Builder() {
      
    }
    
    public Builder term(@Nonnull String term) {
      this.term = term;
      return this;
    }
    
    public SearchQuery build() {
      return new SearchQuery(term);
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
  
  public SearchQuery(@Nonnull String term) {
    Utils.checkNotNull(term, "term == null");      
    this.variables = new SearchQuery.Variables(term);
  }
}
