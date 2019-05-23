package com.app.generated.graphql;

import com.apollographql.apollo.api.Query;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.ResponseFieldMapper;
import com.apollographql.apollo.api.Input;
import type.ModelTodoFilterInput;
import javax.annotation.Nullable;
import java.lang.Integer;
import com.apollographql.apollo.api.ResponseField;
import java.util.Collections;
import com.apollographql.apollo.api.ResponseReader;

@Generated("Apollo GraphQL")
public final class ListTodosQuery implements Query<ListTodosQuery.Data, ListTodosQuery.Data, ListTodosQuery.Variables> {
  public static final String OPERATION_DEFINITION = "query ListTodos($filter: ModelTodoFilterInput, $limit: Int, $nextToken: String) {   listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {     items {       id       name       description     }     nextToken   } }";
  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;
  public static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "ListTodos";
    }
  };
  private final ListTodosQuery.Variables variables;
  @Override
   public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
   public ListTodosQuery.Data wrapData(ListTodosQuery.Data data) {
    return data;
  }
  
  @Override
   public ListTodosQuery.Variables variables() {
    return variables;
  }
  
  @Override
   public ResponseFieldMapper<ListTodosQuery.Data> responseFieldMapper() {
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
    return "e7d954ccc0ea1bdc65aed226eeb8a504";
    }
  }
  public static class Data implements Operation.Data {
    private final @Nullable ListTodos listTodos;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forObject("listTodos", "listTodos", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public Data(@Nullable ListTodos listTodos) {
      this.listTodos = listTodos;
    }
    
    public @Nullable ListTodos listTodos() {
      return this.listTodos;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Data{"
          + "listTodos=" + listTodos + ", "
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
        return ((this.listTodos == null) ? (that.listTodos == null) : this.listTodos.equals(that.listTodos));
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= (listTodos == null) ? 0 : listTodos.hashCode();
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
  

  public static class ListTodos {
    private final @Nonnull String __typename;
    private final @Nullable Items items;
    private final @Nullable String nextToken;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forObject("items", "items", null, true, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("nextToken", "nextToken", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public ListTodos(@Nonnull String __typename, @Nullable Items items, @Nullable String nextToken) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.items = items;
      this.nextToken = nextToken;
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nullable Items items() {
      return this.items;
    }
    
    public @Nullable String nextToken() {
      return this.nextToken;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "ListTodos{"
          + "__typename=" + __typename + ", "
          + "items=" + items + ", "
          + "nextToken=" + nextToken + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals() {
      if (o == this) {
        return true;
      }
      if (o instanceof ListTodos) {
        ListTodos that = (ListTodos) o;
        return this.__typename.equals(that.__typename) && ((this.items == null) ? (that.items == null) : this.items.equals(that.items)) && ((this.nextToken == null) ? (that.nextToken == null) : this.nextToken.equals(that.nextToken));
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
        h ^= (items == null) ? 0 : items.hashCode();
        h *= 1000003;
        h ^= (nextToken == null) ? 0 : nextToken.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    public static final class Mapper implements ResponseFieldMapper<ListTodos> {
      @Override
       public ListTodos map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static class Items {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nonnull String name;
    private final @Nullable String description;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forCustomType("id", "id", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("name", "name", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("description", "description", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public Items(@Nonnull String __typename, @Nonnull String id, @Nonnull String name, @Nullable String description) {
      this.__typename = Utils.checkNotNull(__typename, "__typename == null");
      this.id = Utils.checkNotNull(id, "id == null");
      this.name = Utils.checkNotNull(name, "name == null");
      this.description = description;
    }
    
    public @Nonnull String __typename() {
      return this.__typename;
    }
    
    public @Nonnull String id() {
      return this.id;
    }
    
    public @Nonnull String name() {
      return this.name;
    }
    
    public @Nullable String description() {
      return this.description;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Items{"
          + "__typename=" + __typename + ", "
          + "id=" + id + ", "
          + "name=" + name + ", "
          + "description=" + description + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals() {
      if (o == this) {
        return true;
      }
      if (o instanceof Items) {
        Items that = (Items) o;
        return this.__typename.equals(that.__typename) && this.id.equals(that.id) && this.name.equals(that.name) && ((this.description == null) ? (that.description == null) : this.description.equals(that.description));
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
        h ^= name.hashCode();
        h *= 1000003;
        h ^= (description == null) ? 0 : description.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    public static final class Mapper implements ResponseFieldMapper<Items> {
      @Override
       public Items map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static final class Builder {
    private @Nonnull ModelTodoFilterInput filter;
    private @Nonnull Integer limit;
    private @Nonnull String nextToken;
    Builder() {
      
    }
    
    public Builder filter(@Nonnull ModelTodoFilterInput filter) {
      this.filter = filter;
      return this;
    }
    
    public Builder limit(@Nonnull Integer limit) {
      this.limit = limit;
      return this;
    }
    
    public Builder nextToken(@Nonnull String nextToken) {
      this.nextToken = nextToken;
      return this;
    }
    
    public ListTodosQuery build() {
      return new ListTodosQuery(filter, limit, nextToken);
    }
  }
  
  public ListTodosQuery(@Nullable ModelTodoFilterInput filter, @Nullable Integer limit, @Nullable String nextToken) {
        
    this.variables = new ListTodosQuery.Variables(filter, limit, nextToken);
  }
}
