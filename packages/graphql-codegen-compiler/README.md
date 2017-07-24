# `graphql-codegen-compiler`

This package compiles the output of [`graphql-codegen-core`](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-core/README.md) along with [`GeneratorConfig`](https://github.com/dotansimha/graphql-code-generator/blob/e9e4722723541628bc7ae58c0e4082556af4bfb8/packages/graphql-codegen-generators/src/types.ts#L7-L20) and [`Settings`](https://github.com/dotansimha/graphql-code-generator/blob/e9e4722723541628bc7ae58c0e4082556af4bfb8/packages/graphql-codegen-compiler/src/types.ts#L39-L43), and compiles the template, returns an array of [`FileOutput`](https://github.com/dotansimha/graphql-code-generator/blob/e9e4722723541628bc7ae58c0e4082556af4bfb8/packages/graphql-codegen-compiler/src/types.ts#L6-L9).

The main entry point of the package is `compile` method, and you can import it directly and use it without the CLI package.

We are using Handlebars as template compiler, with some custom Handlebars helpers that helps to generate GraphQL related code easily.

## GraphQL-related Template Helpers

### `toPrimitive(type: string)`

Accepts a string with a GraphQL type and converts it to the language primitive as specified in the template config, if the type isn't a primitive - it just returns it.

Example:
```graphql
type MyType {
  f1: String
}
```
```handlebars
{{#each types}}
    Type {{ name }} fields:
    {{#each fields}}
        Field {{ name }} type is: {{ toPrimitive type }}
    {{/each}}
{{/each}}
```
Output:
```
Type MyType fields:
    Field f1 type is: string
```

### `ifDirective(context: any, directiveName: string)`

Special GraphQL helper that accepts *any* GraphQL entity, and extracts the GraphQL Directives of the entity.

The compiled context is the arguments values of the entity.

Example:
```graphql
type MyType @addName(name: "Dotan") {
  f1: String
}

directive @addName(name: String!) on OBJECT
```
```handlebars
{{#each types}}
    Type name: {{ name }}
    Extra name? {{#ifDirective this "appName"}}Yes! and the name is: {{ name }}{{/ifDirective}}

{{/each}}
```
Output:
```
Type name: MyType
Extra name? Yes! and the name is: Dotan
```

### `unlessDirective(context: any, directiveName: string)`

The opposite of `ifDirective`.

Example:
```graphql
type MyType {
  f1: String
}

directive @addName(name: String!) on OBJECT
```
```handlebars
{{#each types}}
    Type name: {{ name }}
    Extra name? {{#unlessDirective this "appName"}}No!{{/unlessDirective}}

{{/each}}
```
Output:
```
Type name: MyType
Extra name? No!
```

### `withGql(type: string, name: string)` 

Locates GraphQL element of `type` with name `name`, use it if you need to access GraphQL specific element, for example "MyType" of "type".

Super useful when you need to access the actual object inside `withImports` or in any other case. 

```graphql
type MyType {
  f1: String
}
```
```handlebars
{{#withGql "type" "MyType"}}
    {{ name }}
{{/withGql}}
```
Output:
```
MyType
```

### `eachImport(context)`

Locates all external uses of `context`, and returns an array of: `{ name: string, type: string, filename: string }`, so you can use it to create imports when generating multiple files.

`context` can be any GraphQL available object.

```graphql
type MyType {
  f: OtherType
}
```
```handlebars
{{#eachImport this }}
import { {{ name }} } from './{{ file }}';
{{/eachImport}}
```
Output:
```
import { OtherType } from './othertype.type';
```

### `toComment(str: string)`

Prints a string as comment with `/* ... */`, and also trims multiple lines into a single line.

Useful for `description` field of GraphQL entities.

Example:
```handlebars
{{toComment "hi"}}
```
Output:
```
/* hi */
```

### `eachImport(element: any)`

Iterates over a calculated array of imports (file names) that in use by the `element`.

Example:
```handlebars
{{#eachImport type}}
    import { {{ name }} } from './{{file}}';
{{/eachImport}}
```

## Other Template Helpers

### `times(count: number)`

Returns the template child string `count` times, the execution context of the child content is the i/times.

Example:
```handlebars
{{#times 3}}
    Hello {{ this }}!
{{/times}}
```
Output:
```
Hello 0
Hello 1
Hello 2
```

### `for(from: number, to: number, incr: number)`

Similar to `for` loop.

Returns the template child string amount of times according to `from` to `to` by increasing `incr`, the execution context of the child content is the i/times.

Example:
```handlebars
{{#for 3 6 1}}
    Hello {{ this }}!
{{/times}}
```
Output:
```
Hello 3
Hello 4
Hello 5
```

### `limitedEach(from: number, to: number, incr: number)`

Similar to `for` loop.

Returns the template child string amount of times according to `from` to `to` by increasing `incr`, the execution context of the child content is the i/times.

Example:
```handlebars
{{#for 3 6 1}}
    Hello {{ this }}!
{{/times}}
```
Output:
```
Hello 3
Hello 4
Hello 5
```

### `toLowerCase(str: string)`

Return a lowercase version of the string.

Example:
```handlebars
{{toLowerCase "Hello" }}
```
Output:
```
hello
```

### `toUpperCase(str: string)`

Return an uppercase version of the string.

Example:
```handlebars
{{toUpperCase "Hello" }}
```
Output:
```
HELLO
```

### `toSnakeCase(str: string)`

Return an [snake case](https://en.wikipedia.org/wiki/Snake_case) version of the string.

Example:
```handlebars
{{toSnakeCase "doSomething" }}
```
Output:
```
do-something
```

### `toTitleCase(str: string)`

Return an [title case](http://www.grammar-monster.com/lessons/capital_letters_title_case.htm) version of the string.

Example:
```handlebars
{{toTitleCase "doSomething" }}
```
Output:
```
Do Something
```

### `toCamelCase(str: string)`

Return an [camel case](http://wiki.c2.com/?CamelCase) version of the string.

Example:
```handlebars
{{toCamelCase "DoSomething" }}
```
Output:
```
doSomething
```

### `multilineString(str: string)`

Converts a multiline string into a string with line breaks, to prevent code from being broken.

Example:
```handlebars
{{toCamelCase "myString
other line" }}
```
Output:
```
"myString" + 
"other line"
```

### `ifCond(p1: any, comparator: string, p2: any)`

Executes a simple if command of two parameters, using comparator.

Available comparators: `===`, `==`, `!==`, `!=`, `<`, `<=`, `>`, `>=`, `&&`, `||`.

Example:
```handlebars
{{#ifCond "test" "===" "test"}}
   Hi!
{{/ifCond}}
```
Output:
```
    Hi!
```

