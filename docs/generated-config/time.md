
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

### message (`string`, default value: `Generated in`)

Customize the comment message


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - time:
       message: "The file generated in: "
```