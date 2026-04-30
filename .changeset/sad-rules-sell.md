---
'@graphql-codegen/client-preset': major
---

BREAKING CHANGES: The default hashing algorithm is now sha256 instead of sha1. Generated sha256 format also follows the standard outlined in https://github.com/graphql/graphql-over-http/blob/52d56fb36d51c17e08a920510a23bdc2f6a720be/spec/Appendix%20A%20--%20Persisted%20Documents.md#sha256-hex-document-identifier
