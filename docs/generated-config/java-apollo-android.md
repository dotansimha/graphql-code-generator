
### package (`string`)

Customize the Java package name for the generated operations. The default package name will be generated according to the output file path.


#### Usage Example

```yml
generates:
./app/src/main/java/:
  preset: java-apollo-android
  config:
    package: "com.my.paackage.generated.graphql"
  plugins:
    - java-apollo-android
```

### typePackage (`string`)

Customize the Java package name for the types generated based on input types.


#### Usage Example

```yml
generates:
./app/src/main/java/:
  preset: java-apollo-android
  config:
    typePackage: "com.my.paackage.generated.graphql"
  plugins:
    - java-apollo-android
```

### fragmentPackage (`string`)

Customize the Java package name for the fragments generated classes.


#### Usage Example

```yml
generates:
./app/src/main/java/:
  preset: java-apollo-android
  config:
    fragmentPackage: "com.my.paackage.generated.graphql"
  plugins:
    - java-apollo-android
```