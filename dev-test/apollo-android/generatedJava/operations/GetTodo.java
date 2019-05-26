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
import fragment.Item2;
import fragment.Item;
import java.util.Collections;
import com.apollographql.apollo.api.ResponseReader;
import com.apollographql.apollo.api.ResponseFieldMarshaller;
import com.apollographql.apollo.api.ResponseWriter;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.InputFieldWriter;
import java.io.IOException;

@Generated("Apollo GraphQL")
public final class GetTodoQuery implements Query<GetTodoQuery.Data, GetTodoQuery.Data, GetTodoQuery.Variables> {
  public static final String OPERATION_DEFINITION = "query GetTodo($id: ID!) {   getTodo(id: $id) {     ... on Todo {       id     }     ...Item2     ...Item   } }";
  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;
  public static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "GetTodo";
    }
  };
  private final GetTodoQuery.Variables variables;
  @Override
   public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
   public GetTodoQuery.Data wrapData(GetTodoQuery.Data data) {
    return data;
  }
  
  @Override
   public GetTodoQuery.Variables variables() {
    return variables;
  }
  
  @Override
   public ResponseFieldMapper<GetTodoQuery.Data> responseFieldMapper() {
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
    return "2efa7a12cfc5463f2002cdd779aa4266";
  }
  public static class Data implements Operation.Data {
    private final @Nullable GetTodo getTodo;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forObject("getTodo", "getTodo", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public Data(@Nullable GetTodo getTodo) {
      this.getTodo = getTodo;
    }
    
    public @Nullable GetTodo getTodo() {
      return this.getTodo;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Data{"
          + "getTodo=" + getTodo + ", "
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
        return ((this.getTodo == null) ? (that.getTodo == null) : this.getTodo.equals(that.getTodo));
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= (getTodo == null) ? 0 : getTodo.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeObject($responseFields[0], getTodo != null ? getTodo.marshaller() : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<Data> {
      @Override
       public Data map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static class GetTodo {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nonnull Fragments fragments;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forCustomType("id", "id", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forFragment("__typename", "__typename", Arrays.asList("Todo", "Todo"))
      };
    public GetTodo(@Nonnull String __typename, @Nonnull String id, @Nonnull Fragments fragments) {
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
        $toString = "GetTodo{"
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
      if (o instanceof GetTodo) {
        GetTodo that = (GetTodo) o;
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
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeString($responseFields[0], __typename);
          writer.writeCustom((ResponseField.CustomTypeField) $responseFields[1], id);
          writer.writeObject($responseFields[2], fragments != null ? fragments.marshaller() : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<GetTodo> {
      @Override
       public GetTodo map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static final class Builder {
    private @Nonnull String id;
    Builder() {
      
    }
    
    public Builder id(@Nonnull String id) {
      this.id = id;
      return this;
    }
    
    public GetTodoQuery build() {
      return new GetTodoQuery(id);
    }
  }
  

  public static final class Variables extends Operation.Variables {
    private @Nonnull String id;
    private final transient Map<String, Object> valueMap = new LinkedHashMap<>();
    public String id() {
      return id;
    }
    
    public Variables(@Nonnull String id) {
      this.id = id;
      this.valueMap.put("id", id);
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
          writer.writeCustom("id", id);
        }
      };
    }
  }
  
  public GetTodoQuery(@Nonnull String id) {
    Utils.checkNotNull(id, "id == null");      
    this.variables = new GetTodoQuery.Variables(id);
  }
}
