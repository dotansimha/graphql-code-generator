package com.app.generated.graphql;

import com.apollographql.apollo.api.Subscription;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.Operation;
import com.apollographql.apollo.api.ResponseFieldMapper;
import com.apollographql.apollo.api.ResponseField;
import javax.annotation.Nullable;
import javax.annotation.Nonnull;
import java.util.Collections;
import type.CustomType;
import com.apollographql.apollo.api.internal.Utils;
import com.apollographql.apollo.api.ResponseReader;
import com.apollographql.apollo.api.ResponseFieldMarshaller;
import com.apollographql.apollo.api.ResponseWriter;
import java.util.LinkedHashMap;
import java.util.Map;
import com.apollographql.apollo.api.InputFieldMarshaller;
import com.apollographql.apollo.api.InputFieldWriter;
import java.io.IOException;

@Generated("Apollo GraphQL")
public final class OnDeleteTodoSubscription implements Subscription<OnDeleteTodoSubscription.Data, OnDeleteTodoSubscription.Data, Operation.Variables> {
  public static final String OPERATION_DEFINITION = "subscription OnDeleteTodo {   onDeleteTodo {     id     name     description   } }";
  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;
  public static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "OnDeleteTodo";
    }
  };
  private final Operation.Variables variables;
  @Override
   public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
   public OnDeleteTodoSubscription.Data wrapData(OnDeleteTodoSubscription.Data data) {
    return data;
  }
  
  @Override
   public Operation.Variables variables() {
    return variables;
  }
  
  @Override
   public ResponseFieldMapper<OnDeleteTodoSubscription.Data> responseFieldMapper() {
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
    return "9dfd580d494eb7362d1ff0b180ea0bdd";
  }
  
  public OnDeleteTodoSubscription() {
    this.variables = Operation.EMPTY_VARIABLES;
  }
  public static class Data implements Operation.Data {
    private final @Nullable OnDeleteTodo onDeleteTodo;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forObject("onDeleteTodo", "onDeleteTodo", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public Data(@Nullable OnDeleteTodo onDeleteTodo) {
      this.onDeleteTodo = onDeleteTodo;
    }
    
    public @Nullable OnDeleteTodo onDeleteTodo() {
      return this.onDeleteTodo;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Data{"
          + "onDeleteTodo=" + onDeleteTodo + ", "
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
        return ((this.onDeleteTodo == null) ? (that.onDeleteTodo == null) : this.onDeleteTodo.equals(that.onDeleteTodo));
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= (onDeleteTodo == null) ? 0 : onDeleteTodo.hashCode();
        $hashCode = h;
        $hashCodeMemoized = true;
      }
      
      return $hashCode;
    }
    
    public ResponseFieldMarshaller marshaller() {
      return new ResponseFieldMarshaller() {
        @Override
        public void marshal(ResponseWriter writer) {
          writer.writeObject($responseFields[0], onDeleteTodo != null ? onDeleteTodo.marshaller() : null);
        }
      };
    }
    public static final class Mapper implements ResponseFieldMapper<Data> {
      private final OnDeleteTodo.Mapper onDeleteTodoFieldMapper = new OnDeleteTodo.Mapper();
      @Override
       public Data map(ResponseReader reader) {
        final OnDeleteTodo onDeleteTodo = reader.readObject($responseFields[0], new ResponseReader.ObjectReader<OnDeleteTodo>() {
                  @Override
                  public OnDeleteTodo read(ResponseReader reader) {
                    return onDeleteTodoFieldMapper.map(reader);
                  }
                });
        return new Data(onDeleteTodo);
      }
    }
    
  }
  

  public static class OnDeleteTodo {
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
    public OnDeleteTodo(@Nonnull String __typename, @Nonnull String id, @Nonnull String name, @Nullable String description) {
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
        $toString = "OnDeleteTodo{"
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
      if (o instanceof OnDeleteTodo) {
        OnDeleteTodo that = (OnDeleteTodo) o;
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
    public static final class Mapper implements ResponseFieldMapper<OnDeleteTodo> {
      @Override
       public OnDeleteTodo map(ResponseReader reader) {
        final String __typename = reader.readString($responseFields[0]);
        final String id = reader.readCustomType((ResponseField.CustomTypeField) $responseFields[1]);
        final String name = reader.readString($responseFields[2]);
        final String description = reader.readString($responseFields[3]);
        return new OnDeleteTodo(__typename, id, name, description);
      }
    }
    
  }
  

  public static final class Builder {
    Builder() {
      
    }
    
    public OnDeleteTodoSubscription build() {
      return new OnDeleteTodoSubscription();
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

