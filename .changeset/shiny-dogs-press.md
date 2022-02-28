---
'@graphql-codegen/typescript-graphql-request': major
'@graphql-codegen/website': patch
---

Do not specify return types of sdk methods explicitly.

Previously, the return type of all SDK methods was declared manually. This can
cause the return type to become outdated when graphql-request gets updated.
This already happened, as graphql-request removed the errors attribute from the
return type (see https://github.com/prisma-labs/graphql-request/issues/174).
Also, data was marked as possibly undefined which is wrong. data always exists
on a successful response (failed requests throw a ClientError).

A sideeffect of this change is that the extensionsType config became obsolete
and has been removed.
