$(document).ready(function() {
  var socket;
  if (typeof io == 'undefined') {
    socket = comet.connect();
  } else {
    socket = io.connect();
  }
  socket.on("connect", function() {

  }).on("redraw", function (html) {
      $("html").html(html);
  });
});
