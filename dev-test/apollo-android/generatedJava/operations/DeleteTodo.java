package com.app.generated.graphql;

import com.apollographql.apollo.api.Mutation;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;
import com.apollographql.apollo.api.ResponseFieldMapper;
import com.apollographql.apollo.api.Input;
import type.DeleteTodoInput;
import javax.annotation.Nonnull;
import com.apollographql.apollo.api.internal.Utils;
import com.apollographql.apollo.api.ResponseField;
import java.util.Collections;
import com.apollographql.apollo.api.ResponseReader;

@Generated("Apollo GraphQL")
public final class DeleteTodoMutation implements Mutation<DeleteTodoMutation.Data, DeleteTodoMutation.Data, DeleteTodoMutation.Variables> {
  public static final String OPERATION_DEFINITION = "mutation DeleteTodo($input: DeleteTodoInput!) {   deleteTodo(input: $input) {     id     name     description   } }";
  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;
  public static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "DeleteTodo";
    }
  };
  private final DeleteTodoMutation.Variables variables;
  @Override
   public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
   public DeleteTodoMutation.Data wrapData(DeleteTodoMutation.Data data) {
    return data;
  }
  
  @Override
   public DeleteTodoMutation.Variables variables() {
    return variables;
  }
  
  @Override
   public ResponseFieldMapper<DeleteTodoMutation.Data> responseFieldMapper() {
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
    return "f86f628796ee076cc8429f204e1c49cd";
    }
  }
  public static class Data implements Operation.Data {
    private final @Nullable DeleteTodo deleteTodo;
    private volatile String $toString;
    private volatile int $hashCode;
    private volatile boolean $hashCodeMemoized;
    static final ResponseField[] $responseFields = {
        ResponseField.forObject("deleteTodo", "deleteTodo", null, true, Collections.<ResponseField.Condition>emptyList())
      };
    public Data(@Nullable DeleteTodo deleteTodo) {
      this.deleteTodo = deleteTodo;
    }
    
    public @Nullable DeleteTodo deleteTodo() {
      return this.deleteTodo;
    }
    
    @Override
     public String toString() {
      if ($toString == null) {
        $toString = "Data{"
          + "deleteTodo=" + deleteTodo + ", "
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
        return ((this.deleteTodo == null) ? (that.deleteTodo == null) : this.deleteTodo.equals(that.deleteTodo));
      }
      
      return false;
    }
    
    @Override
     public int hashCode() {
      if (!$hashCodeMemoized) {
        int h = 1;
        h *= 1000003;
        h ^= (deleteTodo == null) ? 0 : deleteTodo.hashCode();
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
  

  public static class DeleteTodo {
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
    public DeleteTodo(@Nonnull String __typename, @Nonnull String id, @Nonnull String name, @Nullable String description) {
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
        $toString = "DeleteTodo{"
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
      if (o instanceof DeleteTodo) {
        DeleteTodo that = (DeleteTodo) o;
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
    public static final class Mapper implements ResponseFieldMapper<DeleteTodo> {
      @Override
       public DeleteTodo map(ResponseReader reader) {
        
      }
    }
    
  }
  

  public static final class Builder {
    private @Nonnull DeleteTodoInput input;
    Builder() {
      
    }
    
    public Builder input(@Nonnull DeleteTodoInput input) {
      this.input = input;
      return this;
    }
    
    public DeleteTodoMutation build() {
      return new DeleteTodoMutation(input);
    }
  }
  
  public DeleteTodoMutation(@Nonnull DeleteTodoInput input) {
    Utils.checkNotNull(input, "input == null");      
    this.variables = new DeleteTodoMutation.Variables(input);
  }
}
