# TypeScript template

This template generates TypeScript typings for both client side and server side.

## Generator Config

This generator supports custom config and output behavior. Use to following flags/environment variables to modify your output as you wish:

### `printTime` (or `CODEGEN_PRINT_TIME`, default value: `false`)

Setting this to true will cause the generator to add the time of the generated output on top of the file.

### `avoidOptionals` (or `CODEGEN_AVOID_OPTIONALS`, default value: `false`)

This will cause the generator to avoid using TypeScript optionals (`?`), so the following definition: `type A { myField: String }` will output `myField: string | null` instead of `myField?: string | null`.
