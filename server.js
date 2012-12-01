
var fs   = require('fs');
var md   = require('markdown');
var file = new(require('node-static').Server)(__dirname + '/web', {});
var comet = require('./lib/comet.io.js').createServer();
var app = require('http').createServer(handler);

var host = 'localhost';
var port = 3000;

var target = "test.md";
if (! target) {
  console.error('usage: ' + process.argv.join(' ') + ' <filename>');
  process.exit(1);
}


app.listen(port, host);
console.log('Server running at  http://'+host+':'+port+'/');


function handler(request, response) {
  if (request.url == '/favicon.ico') {
    return;
  }


  //target = __dirname + request.url + ".md";
  target = request.url + ".md";
  target = target.substring(1);

  console.log(target);

  fs.stat(target, function(err, stat) {
    if (err) { throw err;}
    if (!stat.isFile()) {
      request.on('end', 'file not exists.')
    }
  })

  request.on('end', function() {
    if (!comet.serve(request, response)) {
      file.serve(request, response, function(error, res) {
        if (error) { console.log(error); }
      });
    } 
  });
}


comet.on('connection', function (socket) {
  // do something when a client has connected
  drawFile(socket, target);
  
  fs.watchFile(target, { interval: 500 }, function (curr, prev) {
    drawFile(socket, target);
  });
});

function drawFile(socket, target) {
  fs.readFile(target, 'utf8', function (err, text) {
    if (err) { throw err; }
    socket.emit('redraw', md.parse(text));
  });
}

