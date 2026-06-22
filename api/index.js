const serverless = require('serverless-http');
const handler = require('../rss-aggregator.js');

module.exports = serverless(handler, {
  binary: ['image/*', 'font/*'],
});
