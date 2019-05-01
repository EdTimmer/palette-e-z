require('@babel/register');
require('@babel/polyfill/noConflict');
const server = require('../../src/server').default;


module.exports = async () => {
  global.httpserver = await server.start({ port: 4000 })
}