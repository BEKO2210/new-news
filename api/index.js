const serverless = require('serverless-http');
const handler = require('../server.js');

module.exports = serverless(handler, {
  binary: ['image/*', 'font/*'],
});
