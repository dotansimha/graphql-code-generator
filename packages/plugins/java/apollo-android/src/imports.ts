export const Imports = {
  // Primitives
  String: 'java.lang.String',
  Boolean: 'java.lang.Boolean',
  Integer: 'java.lang.Integer',
  Object: 'java.lang.Object',
  Float: 'java.lang.Float',
  Long: 'java.lang.Long',

  // Java Base
  Class: 'java.lang.Class',
  Arrays: 'java.util.Arrays',
  List: 'java.util.List',
  IOException: 'java.io.IOException',
  Collections: 'java.util.Collections',
  LinkedHashMap: 'java.util.LinkedHashMap',
  Map: 'java.util.Map',

  // Annotations
  Nonnull: 'javax.annotation.Nonnull',
  Nullable: 'javax.annotation.Nullable',
  Override: 'java.lang.Override',
  Generated: 'javax.annotation.Generated',

  // Apollo Android
  ScalarType: 'com.apollographql.apollo.api.ScalarType',
  GraphqlFragment: 'com.apollographql.apollo.api.GraphqlFragment',
  Operation: 'com.apollographql.apollo.api.Operation',
  OperationName: 'com.apollographql.apollo.api.OperationName',
  Mutation: 'com.apollographql.apollo.api.Mutation',
  Query: 'com.apollographql.apollo.api.Query',
  Subscription: 'com.apollographql.apollo.api.Subscription',
  ResponseField: 'com.apollographql.apollo.api.ResponseField',
  ResponseFieldMapper: 'com.apollographql.apollo.api.ResponseFieldMapper',
  ResponseFieldMarshaller: 'com.apollographql.apollo.api.ResponseFieldMarshaller',
  ResponseReader: 'com.apollographql.apollo.api.ResponseReader',
  ResponseWriter: 'com.apollographql.apollo.api.ResponseWriter',

  UnmodifiableMapBuilder: 'com.apollographql.apollo.api.internal.UnmodifiableMapBuilder',
  Utils: 'com.apollographql.apollo.api.internal.Utils',

  InputType: 'com.apollographql.apollo.api.InputType',
  Input: 'com.apollographql.apollo.api.Input',
  InputFieldMarshaller: 'com.apollographql.apollo.api.InputFieldMarshaller',
  InputFieldWriter: 'com.apollographql.apollo.api.InputFieldWriter',
};
