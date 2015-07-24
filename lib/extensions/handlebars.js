var Handlebars = require('handlebars'),
  fs = require('fs'),
  path = require('path'),
  readdir = require('fs-readdir-recursive');

module.exports = function load(layouts, options) {
  var registerPartials = function() {
    var files, root = layouts.path(options.partials),
      partials = {};

    if(!options.partials)
      return {};

    if(typeof options.partials !== 'string')
      return options.partials;

    try {
      files = readdir(root);
    } catch(e) {
      throw new Error('Partials path does not exist.');
    }

    files.forEach(function(file) {
      var name = file.substr(0, file.lastIndexOf('.'));
      partials[name] = path.relative(layouts.path(), root + '/' + name);
    });

    return partials;
  };

  layouts.engine = Handlebars;
  layouts.register('partials', options.partials ? registerPartials() : []);
};
