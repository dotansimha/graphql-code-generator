---
id: lifecycle-hooks
title: Lifecycle Hooks
---

The codegen allow you to specify scripts it can run for you in certain events. 

You can specify hooks on the root level, or specify hooks on the output level (only some of them).

Each hook has it's own arguments, and it passes it to your scripts using `argv`. 

## How to use?

Add your scripts to your `codegen.yml` file, and specify the scripts you wish to run, for example:

```yml
hooks:
  afterOneFileWrite:
    - prettier --write
```

Or, for specifc output:

```yml
generates:
  ./src/types.ts:
    hooks:
      afterOneFileWrite:
        - prettier --write
    plugins:
      - typescript
```

## Root Level

The following lifecycle hooks are supported on root level:

### `afterStart`

Trigged with no arguments, when the codegen starts (after the `codegen.yml` has beed readed and parsed).

### `onWatchTriggered`

Triggered every time a file changes when using watch mode.
Triggered with two arguments: the type of the event (for example, `changed`) and the path of the file.

### `onError`

Triggered in case of a general error in the codegen. The argument is a string containing the error.

### `beforeAllFileWrite`

Executed after the codegen has done creating the output and before writing the files to the file-system.
Triggerd with multiple arguments - paths for all relevant files.

> Not all the files will be actually written to the file-system, because this is triggered before checking if the file has changed since last execution.

### `beforeOneFileWrite`

Triggered before a file is written to the file-system. Executed with the path for the file.

If the content of the file hasn't changed since last execution - this hooks won't be triggerd.

### `afterOneFileWrite`

Triggered after a file is written to the file-system. Executed with the path for the file.
If the content of the file hasn't changed since last execution - this hooks won't be triggerd.

> This is a very useful hook, you can use it for integration with Prettier or other linters.

### `afterAllFileWrite`

Executed after writing all the files to the file-system.
Triggerd with multiple arguments - paths for all files.

### `beforeDone`

Triggerd with no arguments, right before the codegen closes, or when watch mode is stopped.

## Output Level

The following hooks are avialable for a single output file: `beforeOneFileWrite` and `afterOneFileWrite`.

Output level hooks are triggerd before root level hooks.
