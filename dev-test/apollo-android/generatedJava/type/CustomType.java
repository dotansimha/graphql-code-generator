package type;

import com.apollographql.apollo.api.ScalarType;
import java.lang.Class;
import java.lang.Override;
import javax.annotation.Generated;
import java.lang.String;
import java.lang.Long;

@Generated("Apollo GraphQL")
public enum CustomType implements ScalarType {
  ID {
    @Override
    public String typeName() {
      return "ID";
    }
  
    @Override
    public Class javaType() {
      return String.class;
    }
  },

  AWSDATE {
    @Override
    public String typeName() {
      return "AWSDate";
    }
  
    @Override
    public Class javaType() {
      return Long.class;
    }
  }
}
