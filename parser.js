// require
var marked   = require('marked');
var textile = require('textile-js');

// define parser
var parser = {
  'markdown' : function(text) {
    return marked(text);
  },
  'textile' : function(text) {
    return textile(text);
  },
};

// parse
exports.parse = function(type, text) {
  return parser[type](text);
};


