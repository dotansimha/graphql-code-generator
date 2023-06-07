import { createServer } from 'http';
import { yoga } from './yoga.js';

const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  // eslint-disable-next-line no-console
  console.info('Server is running on http://localhost:4000/graphql');
});
