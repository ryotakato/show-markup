// config
var config = require('./config.json');
config.docRoot = process.cwd();
config.webRoot = __dirname + '/web';

// run
exports.run = function() {
  // init handler
  var handler = require('./handler')(config);
  // server running
  require('http')
    .createServer(handler)
    .listen(config.port, config.host);
  // start log
  console.log('Server running at http://' + config.host + ':' + config.port + '/');
  console.log('document root is ' + config.docRoot);
};

