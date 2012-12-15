// require
var fs = require('fs');
var path = require('path');
var parser = require('./parser');
var comet = require('comet.io').createServer();

// variable
var docRoot;
var exts;

// module object
module.exports = function (config) {

  // read from config
  docRoot = config.docRoot;
  exts = config.extension;
  
  // comet settiong
  comet.on('connection', function (socket) { //{{{
    // client has connected
  
    socket.on('locate', function(data) {
      var file = docRoot + data.file;
  
      // markup file
      fs.exists(file, function(exists) {
        if (exists) {
          // first time draw
          readMarkup(file, function(err, html) {
            socket.emit('draw', html);
          });
          fs.watchFile(file, { interval: 500 }, function (curr, prev) {
            // draw after editted
            readMarkup(file, function(err, html) {
              socket.emit('draw', html);
            });
          });
        }
      });
    });
  
  });//}}}

  // return comet object
  return comet;
};


// draw markup file to browser
function readMarkup(file, callback) {//{{{
  fs.readFile(file, 'utf8', function (err, text) {
    callback(err, parser.parse(exts[path.extname(file)], text));
  });
}//}}}


