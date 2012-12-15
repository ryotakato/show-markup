$(document).ready(function() {
  var socket;
  if (typeof io == 'undefined') {
    socket = comet.connect();
  } else {
    socket = io.connect();
  }
  socket.on("connect", function() {
    socket.emit('locate', { file:location.pathname });
  }).on("draw", function (html) {
    $("html").html(html);
  });
});
