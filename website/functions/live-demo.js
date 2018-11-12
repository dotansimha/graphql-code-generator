const { executeCodegen } = require('graphql-code-generator');
const { safeLoad } = require('js-yaml');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
};

exports.handler = (event, context, callback) => {
  if (event.httpMethod === 'OPTIONS') {
    return callback(null, {
      statusCode: 200,
      headers,
      body: ''
    });
  }
  if (event.httpMethod !== 'POST') {
    return callback(null, {
      statusCode: 200,
      body: 'Incorrect params!',
      headers
    });
  }

  const body = JSON.parse(event.body);
  const schema = body.schema;
  const documents = body.documents || [];
  const config = body.config || {};

  const fullConfig = {
    schema: [schema],
    documents,
    ...safeLoad(config)
  };

  executeCodegen(fullConfig)
    .then(output => {
      callback(null, {
        statusCode: 200,
        body: output[0].content,
        headers
      });
    })
    .catch(e => {
      console.log(e);
      callback(null, {
        statusCode: 200,
        body: e.message,
        headers
      });
    });
};
