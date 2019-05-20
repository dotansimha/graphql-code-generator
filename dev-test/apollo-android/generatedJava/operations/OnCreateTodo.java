package com.app.generated.graphql;

import com.apollographql.apollo.api.Subscription;
import java.lang.String;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.OperationName;

@Generated("Apollo GraphQL")
public final class OnCreateTodoSubscription implements Subscription<OnCreateTodoSubscription.Data, OnCreateTodoSubscription.Data, OnCreateTodoSubscription.Variables> {
  public static final String OPERATION_DEFINITION = "subscription OnCreateTodo {   onCreateTodo {     id     name     description   } }";

  public static final String QUERY_DOCUMENT = OPERATION_DEFINITION;

  private static final OperationName OPERATION_NAME = new OperationName() {
    @Override
    public String name() {
      return "OnCreateTodo";
    }
  };

  private final OnCreateTodoSubscription.Variables variables;

  public OnCreateTodoSubscription() {
        
    this.variables = Operation.EMPTY_VARIABLES;
  }

  @Override
  public String operationId() {
    return "428b3d0142cc5cb6cd6748540efb25c7";
  }

  @Override
  public String queryDocument() {
    return QUERY_DOCUMENT;
  }
  
  @Override
  public OnCreateTodoSubscription.Data wrapData(OnCreateTodoSubscription.Data data) {
    return data;
  }
  
  @Override
  public OnCreateTodoSubscription.Variables variables() {
    return variables;
  }
  
  @Override
  public ResponseFieldMapper<OnCreateTodoSubscription.Data> responseFieldMapper() {
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
