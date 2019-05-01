import '@babel/polyfill';   //if get warning replace with '@babel/polyfill/noConflict'
import server from './server';

//By default goes to localhost port 4000
server.start({ port: process.env.PORT || 4000 }, () => {
  console.log('The server is up!');
});
