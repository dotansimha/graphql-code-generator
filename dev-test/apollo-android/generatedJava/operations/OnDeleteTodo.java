package com.app.generated.graphql;

import com.apollographql.apollo.api.Subscription;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;

@Generated("Apollo GraphQL")
public final class OnDeleteTodoSubscription implements Subscription<OnDeleteTodoSubscription.Data, OnDeleteTodoSubscription.Data, OnDeleteTodoSubscription.Variables> {
  public static final String OPERATION_DEFINITION = "subscription OnDeleteTodo {   onDeleteTodo {     id     name     description   } }";

  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;

  private static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "OnDeleteTodo";
    }
  };

  private final OnDeleteTodoSubscription.Variables variables;

  public OnDeleteTodoSubscription() {
        
    this.variables = Operation.EMPTY_VARIABLES;
  }

  @Override
  public String operationId() {
    return "9dfd580d494eb7362d1ff0b180ea0bdd";
  }

  @Override
  public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
  public OnDeleteTodoSubscription.Data wrapData(OnDeleteTodoSubscription.Data data) {
    return data;
  }
  
  @Override
  public OnDeleteTodoSubscription.Variables variables() {
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
}
