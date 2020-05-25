---
id: time
title: Time
---

## Installation

    $ yarn add -D @graphql-codegen/time

## Configuration

You can either specify a `string` that contains the moment format, or specify an object with the following:


### format (`string`, default value: `YYYY-MM-DDTHH:mm:ssZ`)

Customize the Moment format of the output time.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - time:
       format: DD.MM.YY
```

### message (`string`, default value: `Generated on`)

Customize the comment message


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - time:
       message: "The file generated on: "
```