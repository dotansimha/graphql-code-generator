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
import fragment.A;
import fragment.B;
import java.util.Collections;
import com.apollographql.apollo.api.ResponseReader;

@Generated("Apollo GraphQL")
public final class SearchOneQuery implements Query<SearchOneQuery.Data, SearchOneQuery.Data, SearchOneQuery.Variables> {
  public static final String OPERATION_DEFINITION = "query SearchOne($term: String!) {   searchOne(term: $term) {     ...A     ...B     ... on A {       id     }     ... on B {       id     }   } }";
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
    new Builder();
  }
  
  @Override
   public OperationName name() {
    return OPERATION_NAME;
  }
  
  public String operationId() {
    return "653aff32c6b38de801080dad1ec58839";
    }
  }
  public static class Data implements Operation.Data {
    private final @Nonnull SearchOne searchOne;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forObject("searchOne", "searchOne", null, false, Collections.<ResponseField.Condition>emptyList())
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
     public boolean equals() {
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
    public static final class Mapper implements ResponseFieldMapper<Data> {
      @Override
       public Data map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static class SearchOne {
    private final @Nonnull String __typename;
    private final @Nullable AsA asA;
    private final @Nullable AsB asB;
    private final @Nonnull Fragments fragments;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forInlineFragment("__typename", "__typename", Arrays.asList("A")),
        ResponseField.forInlineFragment("__typename", "__typename", Arrays.asList("B")),
        ResponseField.forFragment("__typename", "__typename", Arrays.asList("A", "B"))
      };
    public SearchOne(@Nonnull String __typename, @Nullable AsA asA, @Nullable AsB asB, @Nonnull Fragments fragments) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.asA = asA;
      this.asB = asB;
      this.fragments = Utils.checkNotNull(fragments, "fragments == null");
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nullable AsA asA() {
      return this.asA;
    }
    
    public @Nullable AsB asB() {
      return this.asB;
    }
    
    public @Nonnull Fragments fragments() {
      return this.fragments;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "SearchOne{"
          + "__typename=" + __typename + ", "
          + "asA=" + asA + ", "
          + "asB=" + asB + ", "
          + "fragments=" + fragments + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals() {
      if (o == this) {
        return true;
      }
      if (o instanceof SearchOne) {
        SearchOne that = (SearchOne) o;
        return this.__typename.equals(that.__typename) && ((this.asA == null) ? (that.asA == null) : this.asA.equals(that.asA)) && ((this.asB == null) ? (that.asB == null) : this.asB.equals(that.asB)) && this.fragments.equals(that.fragments);
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
        h ^= (asA == null) ? 0 : asA.hashCode();
        h *= 1000003;
        h ^= (asB == null) ? 0 : asB.hashCode();
        h *= 1000003;
        h ^= fragments.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    public static final class Mapper implements ResponseFieldMapper<SearchOne> {
      @Override
       public SearchOne map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static class AsA {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nonnull Fragments fragments;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forCustomType("id", "id", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forFragment("__typename", "__typename", Arrays.asList("A", "B"))
      };
    public AsA(@Nonnull String __typename, @Nonnull String id, @Nonnull Fragments fragments) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.id = Utils.checkNotNull(id, "id == null");
      this.fragments = Utils.checkNotNull(fragments, "fragments == null");
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nonnull String id() {
      return this.id;
    }
    
    public @Nonnull Fragments fragments() {
      return this.fragments;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "AsA{"
          + "__typename=" + __typename + ", "
          + "id=" + id + ", "
          + "fragments=" + fragments + ", "
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
        return this.__typename.equals(that.__typename) && this.id.equals(that.id) && this.fragments.equals(that.fragments);
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
        h ^= fragments.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
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
    private final @Nonnull Fragments fragments;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forCustomType("id", "id", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forFragment("__typename", "__typename", Arrays.asList("A", "B"))
      };
    public AsB(@Nonnull String __typename, @Nonnull String id, @Nonnull Fragments fragments) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.id = Utils.checkNotNull(id, "id == null");
      this.fragments = Utils.checkNotNull(fragments, "fragments == null");
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nonnull String id() {
      return this.id;
    }
    
    public @Nonnull Fragments fragments() {
      return this.fragments;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "AsB{"
          + "__typename=" + __typename + ", "
          + "id=" + id + ", "
          + "fragments=" + fragments + ", "
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
        return this.__typename.equals(that.__typename) && this.id.equals(that.id) && this.fragments.equals(that.fragments);
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
        h ^= fragments.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
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
    
    public SearchOneQuery build() {
      return new SearchOneQuery(term);
    }
  }
  
  public SearchOneQuery(@Nonnull String term) {
    Utils.checkNotNull(term, "term == null");      
    this.variables = new SearchOneQuery.Variables(term);
  }
}
