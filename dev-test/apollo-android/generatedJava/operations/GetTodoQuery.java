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
import javax.annotation.Nullable;
import javax.annotation.Nonnull;
import java.util.Collections;
import type.CustomType;
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
public final class GetTodoQuery implements Query<GetTodoQuery.Data, GetTodoQuery.Data, GetTodoQuery.Variables> {
  public static final String OPERATION_DEFINITION = "query GetTodo($id: ID!) {   getTodo(id: $id) {     id     name     description   } }";
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
    return new Builder();
  }
  
  @Override
   public OperationName name() {
    return OPERATION_NAME;
  }
  
  public String operationId() {
    return "c44eec87be1feca567e036c2f6aa2905";
  }
  
  public GetTodoQuery(String id) {
    Utils.checkNotNull(id, "id == null");
    this.variables = new GetTodoQuery.Variables(id);
  }
  public static class Data implements Operation.Data {
    private final @Nullable GetTodo getTodo;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forObject("getTodo", "getTodo", new UnmodifiableMapBuilder<String, Object>(1).put("id", new UnmodifiableMapBuilder<String, Object>(2).put("kind", "Variable").put("variableName", "id").build()).build(), true, Collections.<ResponseField.Condition>emptyList())
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
     public boolean equals(Object o) {
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
      private final GetTodo.Mapper getTodoFieldMapper = new GetTodo.Mapper();
      @Override
       public Data map(ResponseReader reader) {
        final GetTodo getTodo = reader.readObject($responseFields[0], new ResponseReader.ObjectReader<GetTodo>() {
                  @Override
                  public GetTodo read(ResponseReader reader) {
                    return getTodoFieldMapper.map(reader);
                  }
                });
        return new Data(getTodo);
      }
    }
    
  }
  

  public static class GetTodo {
    private final @Nonnull String __typename;
    private final @Nonnull String id;
    private final @Nonnull String name;
    private final @Nullable String description;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forCustomType("id", "id", null, false, CustomType.ID, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("name", "name", null, false, Collections.<ResponseField.Condition>emptyList()),
        ResponseField.forString("description", "description", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public GetTodo(@Nonnull String __typename, @Nonnull String id, @Nonnull String name, @Nullable String description) {
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
        $toString = "GetTodo{"
          + "__typename=" + __typename + ", "
          + "id=" + id + ", "
          + "name=" + name + ", "
          + "description=" + description + ", "
          + "}";
      }
      
      return $toString;
    }
    
    @Override
     public boolean equals(Object o) {
      if (o == this) {
        return true;
      }
      if (o instanceof GetTodo) {
        GetTodo that = (GetTodo) o;
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
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeString($responseFields[0], __typename);
          writer.writeCustom((ResponseField.CustomTypeField) $responseFields[1], id);
          writer.writeString($responseFields[2], name);
          writer.writeString($responseFields[3], description != null ? description : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<GetTodo> {
      @Override
       public GetTodo map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final String id = reader.readCustomType((ResponseField.CustomTypeField) $responseFields[1]);
        final String name = reader.readString($responseFields[2]);
        final String description = reader.readString($responseFields[3]);
        return new GetTodo(__typename, id, name, description);
      }
    }
    
  }
  

  public static final class Builder {
    private @Nullable String id;
    Builder() {
      
    }
    
    public Builder id(@Nullable String id) {
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
          writer.writeString("id", id);
        }
      };
    }
  }
  
}
