package com.app.generated.graphql;

import java.util.Arrays;
import com.apollographql.apollo.api.GraphqlFragment;
import java.util.List;
import java.lang.String;
import java.util.Collections;
import java.lang.Override;
import javax.annotation.Generated;
import com.apollographql.apollo.api.ResponseFieldMapper;
import com.apollographql.apollo.api.ResponseField;
import javax.annotation.Nullable;
import javax.annotation.Nonnull;
import com.apollographql.apollo.api.internal.Utils;
import com.apollographql.apollo.api.ResponseReader;
import com.apollographql.apollo.api.ResponseFieldMarshaller;
import com.apollographql.apollo.api.ResponseWriter;

public class BF implements GraphqlFragment {
  private final @Nonnull String __typename;
  private final @Nullable String b;
  private volatile String $toString;
  private volatile int $hashCode;
  private volatile boolean $hashCodeMemoized;
  static final ResponseField[] $responseFields = {
      ResponseField.forString("__typename", "__typename", null, false, Collections.<ResponseField.Condition>emptyList()),
      ResponseField.forString("b", "b", null, true, Collections.<ResponseField.Condition>emptyList())
    };
  public static final String FRAGMENT_DEFINITION = "fragment BF on B {   b }";
  public static final List<String> POSSIBLE_TYPES = Collections.unmodifiableList(Arrays.asList("B"));
  public BF(@Nonnull String __typename, @Nullable String b) {
    this.__typename = Utils.checkNotNull(__typename, "__typename == null");
    this.b = b;
  }
  
  public @Nonnull String __typename() {
    return this.__typename;
  }
  
  public @Nullable String b() {
    return this.b;
  }
  
  @Override
   public String toString() {
    if ($toString == null) {
      $toString = "BF{"
        + "__typename=" + __typename + ", "
        + "b=" + b + ", "
        + "}";
    }
    
    return $toString;
  }
  
  @Override
   public boolean equals(Object o) {
    if (o == this) {
      return true;
    }
    if (o instanceof BF) {
      BF that = (BF) o;
      return this.__typename.equals(that.__typename) && ((this.b == null) ? (that.b == null) : this.b.equals(that.b));
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
      h ^= (b == null) ? 0 : b.hashCode();
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
        writer.writeString($responseFields[1], b != null ? b : null);
      }
    };
  }
  public static final class Mapper implements ResponseFieldMapper<BF> {
    @Override
     public BF map(ResponseReader reader) {
      final String __typename = reader.readString($responseFields[0]);
      final String b = reader.readString($responseFields[1]);
      return new BF(__typename, b);
    }
  }
  
}
