package com.app.generated.graphql;

import com.apollographql.apollo.api.Subscription;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;

@Generated("Apollo GraphQL")
public final class OnUpdateTodoSubscription implements Subscription<OnUpdateTodoSubscription.Data, OnUpdateTodoSubscription.Data, OnUpdateTodoSubscription.Variables> {
  public static final String OPERATION_DEFINITION = "subscription OnUpdateTodo {   onUpdateTodo {     id     name     description   } }";

  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;

  private static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "OnUpdateTodo";
    }
  };

  private final OnUpdateTodoSubscription.Variables variables;

  public OnUpdateTodoSubscription() {
        
    this.variables = Operation.EMPTY_VARIABLES;
  }

  @Override
  public String operationId() {
    return "8f638b2057f5c82c9ac9c3594486b499";
  }

  @Override
  public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
  public OnUpdateTodoSubscription.Data wrapData(OnUpdateTodoSubscription.Data data) {
    return data;
  }
  
  @Override
  public OnUpdateTodoSubscription.Variables variables() {
    return variables;
  }
  
  @Override
  public ResponseFieldMapper<OnUpdateTodoSubscription.Data> responseFieldMapper() {
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
