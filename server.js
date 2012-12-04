
var host = 'localhost';
var port = 3000;
var docRoot = process.cwd();
var webRoot = __dirname + '/web';

var exts = { 
  '.md' : 'md', 
  '.markdown' : 'md'
};


var fs   = require('fs');
var url = require('url');
var path = require('path');
var md   = require('markdown');
var marked   = require('marked');
var static = new(require('node-static').Server)(webRoot, {});
var comet = require('comet.io').createServer();
var app = require('http').createServer(handler);

// check web dir
if (!fs.existsSync(webRoot)) {
  console.log('Error : directory not exists : ' + webRoot);
  process.exit(1);
}



var target;


// run
function run() {

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
  
  // server running
  app.listen(port, host);
  console.log('Server running at http://' + host + ':' + port + '/');
  console.log('document root is ' + docRoot);

}

// def handler
function handler(req, res) {//{{{
  req.on('end', function() {
    if (!comet.serve(req, res)) {

      var pathname = url.parse(req.url).pathname;
      if (pathname == '/favicon.ico') {
        // nothing favicon
        res.end();

      } else {

        var absPath = docRoot + pathname;

        exists(absPath, function() {
          // exists
          fs.stat(absPath, function(err, stats) {
            if (stats.isFile()) {
              // request equals file
              if (path.extname(pathname) in exts) {
                // markup target file
                
                // save to global variable
                // to send comet.on method
                target = absPath;
                // read index
                fs.readFile(webRoot+ '/index.html', function(err, data) {
                  res.writeHead(200, {'Content-Type': 'text/html'});
                  res.end(data);
                });
              }

            } else if (stats.isDirectory()) {
              // request equals dir
              lsMarkupFiles(res, absPath);
            }
          });

        },function() {
          // not exists

          exists(webRoot + pathname, function() {
            // serve static files
            static.serve(req, res, function(err, result) {
              //if (err) { console.log(err); }
              res.end()
            });

          });
        });

      }
    }
  });
}//}}}


// ls to reqponse only markup files
function lsMarkupFiles(res, dirName) {//{{{
  var rDirPath = path.relative(docRoot, dirName);
  rDirPath = rDirPath && rDirPath + '/';
  // read dir
  fs.readdir(dirName, function(err, files) {
    // write to response
    res.writeHead(200, {'Content-Type': 'text/html'});
    for (var i = 0; i < files.length; i ++) {
      var file = files[i];
      // if file is markup or directory
      if (path.extname(file) in exts || fs.statSync(rDirPath + file).isDirectory()) {
        res.write('<a href="/' + rDirPath + file + '" >' + file + '</a><br/>');
      }
    }
    res.end();
  });
}//}}}


// draw markup file to browser
function drawFile(socket, file) {//{{{
  //console.log('redraw : ' + file);
  fs.readFile(file, 'utf8', function (err, text) {
    if (err) { throw err; }
    socket.emit('redraw', md.parse(text));
    //socket.emit('redraw', marked(text));
  });
}//}}}

// file exists 
function exists(file, existsCallback, notExistsCallback) {//{{{
  fs.exists(file, function(exists) {
    if (exists) {
      existsCallback();
    } else {
      notExistsCallback();
    }
  });
}//}}}



exports.run = run;




