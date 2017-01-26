# Enhance your GraphQL development experience with code generator

## Introduction

Few months ago, I started exploring GraphQL tools and tried to find new ways to enhance my developer experience with GraphQL, 
and one the things that bothered me the most as an enthusiastic TypeScript developer, I had a lot of lint errors and IDE errors regarding types.

Also, I wanted a good auto-completion, based on my GraphQL schema and GraphQL documents.

I also wanted to get in-depth of GraphQL schema and to learn how it actually works, and learing about GraphQL Introspection is a great place to start. 

In order to get the experience I was looking for, I started to write a code-generator for GraphQL, and I used Swagger code generator as inspiration.

The magic behind every good code generator, is the ability to change and extend the results quickly, while maintaining a simple (yet flexible) data structure based on your GraphQL schema and documents.

Code generators are also code for wrapping your data layer with a consistent code - for example, you can create generate a function that executes the GraphQL document throught you network interface, fetches the data and returns a response wrapped in a custom structure. You can do this for all of you queries and mutations, this way you know all of your access to GraphQL server is the same, and in the response you get an object with fields based on your actual schema, instead of dictionary.

Let my explain:

First, we start with the GraphQL schema defined in our server-side, and try to understand it's structure and the links between the types and scalars (called GraphQL introspection query), then we modify the structure of this metadata into a custom structue that will later be simple to use.

Now, we need to take a code template (usually based on a template engine, such as Handlebars.js or Mustach), and compile it with the data structure we created earlier.

This is a pseudo code example:

Let's take the following GraphQL schema:

```graphql
type Person {
   name: String!
   age: Int
}
```

The code generator transforms this definition into a custom JSON data structure, for example:

```json
{
    "models": [
      {
        "name": "Person",
        "fields": [
          {
            "name": "name",
            "type": "string",
            "required": true
          },
          {
            "name": "age",
            "type": "number",
            "required": false
          }
        ]
      }
    ]
}
```

Now, we have a generic JSON structure, and if we want to turn our schema into TypeScript type definition, we need to compile it with the following template:

```handlebars
{{#each models}}
  export type {{name}} = {
    {{#each fields}}
      {{name}}{{#unless required}}?{{/unless}}: {{ type }};
    {{/each}}
  };
{{/each}}
```

Now when we compile the two together, we will get:

```ts
  export type Person {
    name: string;
    age?: number;
  }
```

This is a simple example, because in real life, GraphQL allows use to do much more in our schema: define enums, custom scalars, unions, interfaces, add arguments in each field, and more.

Now let's take in to the next level - because GraphQL schema isn't everything GraphQL has - in our client side, we defined our Query, Mutation, Subscription and Fragment, along with directives, arguments and more - those are called documents. 

The ideas is basicly the same: we take the client side documents, transform it into a simple structure, then compile it with a template.

## Take it to the next level

As time went by, I noticed that there are more GraphQL developers that struggle with the same issue - development environments such as Swift does not play along with JSON, and need to have data structures (`struct`s) defined in order to get a better expirience (otherwise, you have to treat you data as a dictionary).

I created more templates, and at the moment there are generators for the following: 

* TypeScript
* Flow
* Swift (with Apollo)

And I am looking for more GraphQL developers which use different environments in order to add more generators and support those GraphQL communities.

## Getting Started

To get started with the GraphQL code generator, start by installing the latest version of NodeJS (6/7), and then install it as a global module:

```
  npm install -g graphql-code-gen
```

Then, make sure that you GraphQL schema is available for use - either in JSON file or development sever.

Also, make sure you GraphQL documents are inside `.graphql` files (you don't have to, you can also put in JavaScript files with `graphql-tag`! is find it automaticlly!).

Now, run the generator with your config (this example uses remote GraphQL server with local GraphQL documents, and generates TypeScript typings to `./types/` directory):

```
gql-gen --url http://localhost:3010/graphql --template typescript --out ./types/graphql-typings.d.ts ./src/**/*.graphql
```

That's it! your schema and documents are now TypeScript typings! and you won't see any IDE or linter error when using GraphQL! 

> The tool also allows you to generate only your server side schema if you want, without the GraphQL documents.

## Code Generator Implementation

The code generator is a CLI util, written in TypeScript & NodeJS, that every developer can use, regardless the environment or the language in use.

Using `graphql` package, I was able to load the schema and execute [Intorspection Query](http://graphql.org/learn/introspection/), then recursively iterate over the types and links, and defined custom structure for the Models.

Then, do the same for client side documents, while assisting the server side schema to understand the types. (the full custom structure [is here](https://github.com/dotansimha/graphql-code-generator/blob/master/src/models/interfaces.ts)).

The trick in client side documents is to create the correct selection set object, in each document.

For example, when using this schema:

```graphql
type Person {
   name: String
   age: Int
}

type Query {
   me: Person
}
```

And query only for `name`:

```graphql
query myQuery {
    me {
       name
    }
}
```

We want to generate a new type, called `MyQuery_Me` which based on the server side type `Person`, but only with the fields we wanted - `name`.

So while building the custom structue, we use a config flag called `flatten` per each langauge, because there are languages that allows us to flatten the inner types we just explained, and group them all together (for example, TypeScript allows you to create `module` or `namespace`, but in Swift, you have to create a recusive `struct`s).

The next step is to implement the template for for server side and client side, the template engine I picked is [Handlebars.js](http://handlebarsjs.com/) because it comes with a set of great template utils (such as `each`, `if` and `unless`), but allows you to create a custom helpers - and 
this is a feature I wanted to preserve and allow other developers use when creating custom templates - so each language template can implement it own template, config and template helpers!

Also, Handlebars.js allows you to create a partial templates and use them inside each other, so you can easily create a recursive template the load it's self - which it very useful when dealing with infinite inner-types (exactly whats GraphQL has).

A great example for using all of those feature, is [the implementation of the Swift generator](https://github.com/dotansimha/graphql-code-generator/tree/master/generators/swift-apollo-single-file).
