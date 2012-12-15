// require 
var fs = require('fs');
var url = require('url');
var path = require('path');

// variable
var webRoot;
var docRoot;
var exts;
var comet;
var static;


// module object
module.exports = function (config) {

  // read from config
  webRoot = config.webRoot;
  docRoot = config.docRoot;
  exts = config.extension;
  
  // server
  comet = require('./cometer')(config);
  static = new(require('node-static').Server)(webRoot, {});

  return handle;
};

// define handle
function handle(req, res) {//{{{
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
                
                // read index
                fs.readFile(webRoot + '/index.html', function(err, data) {
                  res.writeHead(200, {'Content-Type': 'text/html'});
                  res.end(data);
                });
              }

            } else if (stats.isDirectory()) {
              // request equals dir
              lsFiles(res, absPath);
            }
          });

        },function() {
          // not exists

          exists(webRoot + pathname, function() {
            // serve static files
            static.serve(req, res);
          });
        });

      }
    }
  });
}//}}}

// ls to reqponse only markup files
function lsFiles(res, dirName) {//{{{
  var rDirPath = path.relative(docRoot, dirName);
  rDirPath = rDirPath && rDirPath + '/';
  // read dir
  fs.readdir(dirName, function(err, files) {
    // write to response
    res.writeHead(200, {'Content-Type': 'text/html'});
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      // if file is markup or directory
      if (path.extname(file) in exts || fs.statSync(rDirPath + file).isDirectory()) {
        res.write('<a href="/' + rDirPath + file + '" >' + file + '</a><br/>');
      }
    }
    res.end();
  });
}//}}}

// file exists 
function exists(file, existsCallback, notExistsCallback) {//{{{
  fs.exists(file, function(exists) {
    if (exists) {
      if (existsCallback) { existsCallback(); }
    } else {
      if (notExistsCallback) { notExistsCallback(); }
    }
  });
}//}}}
