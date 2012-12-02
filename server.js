
var host = 'localhost';
var port = 3000;
var root = __dirname + '/web';

var exts = { 
  '.md' : 'md', 
  '.markdown' : 'md'
};

var fs   = require('fs');
var url = require('url');
var path = require('path');
var md   = require('markdown');
var static = new(require('node-static').Server)(root, {});
var comet = require('comet.io').createServer();
var app = require('http').createServer(handler);


var target;

// server running
app.listen(port, host);
console.log('Server running at  http://' + host + ':' + port + '/');


// def handler
function handler(req, res) {
  req.on('end', function() {
    if (!comet.serve(req, res)) {

      var pathname = url.parse(req.url).pathname;
      if (pathname == '/favicon.ico') {
        // nothing favicon
        res.end();

      } else {

        var absPath = root + pathname;

        exists(absPath, function() {
          fs.stat(absPath, function(err, stats) {
            if (stats.isFile()) {
              // request equals file
              if (path.extname(pathname) in exts) {
                // markup target file
                
                // save to global variable
                // to send comet.on method
                target = absPath;
                // read index
                fs.readFile(root + '/index.html', function(err, data) {
                  res.writeHead(200, {'Content-Type': 'text/html'});
                  res.end(data);
                });
              } else {
                // other
                static.serve(req, res, function(err, result) {
                  //if (err) { console.log(err); }
                  res.end()
                });
              }

            } else if (stats.isDirectory()) {
              // request equals dir
              lsMarkupFiles(res, absPath);
            }
          });
        });

      }
    }
  });
}

// ls to reqponse only markup files
function lsMarkupFiles(res, dirName) {
  fs.readdir(dirName, function(err, files) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    for (var i = 0; i < files.length; i ++) {
      var file = files[i];
      if (path.extname(file) in exts) {
        res.write('<a href="' + path.relative(root, dirName) + '/' + file + '" >' + file + '</a><br/>');
      }
    }
    res.end();
  });
}


comet.on('connection', function (socket) {
  // client has connected

  // save to local variable
  var file = target;

  exists(file, function() {
    // first time draw
    drawFile(socket, file);
    fs.watchFile(file, { interval: 500 }, function (curr, prev) {
      // draw after editted
      drawFile(socket, file);
    });
  });
});

// draw markup file to browser
function drawFile(socket, file) {
  //console.log('redraw : ' + file);
  fs.readFile(file, 'utf8', function (err, text) {
    if (err) { throw err; }
    socket.emit('redraw', md.parse(text));
  });
}

// file exists 
function exists(file, callback) {
  fs.exists(file, function(exists) {
    if (exists) {
      callback();
    }
  });
}
