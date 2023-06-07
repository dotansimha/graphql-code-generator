import { createServer } from 'http';
import { makeYoga } from './yoga.js';

import persistedDocumentsDictionary from './gql/persisted-documents.json';

const persistedDocuments = new Map<string, string>(Object.entries(persistedDocumentsDictionary));

const yoga = makeYoga({ persistedDocuments });
const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  // eslint-disable-next-line no-console
  console.info('Server is running on http://localhost:4000/graphql');
});
