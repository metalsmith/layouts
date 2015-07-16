
var consolidate = require('consolidate');
var debug = require('debug')('metalsmith-layouts');
var each = require('async').each;
var extend = require('extend');
var match = require('multimatch');
var omit = require('lodash.omit');
var fs = require('fs');
var path = require('path');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Settings.
 */

var settings = ['engine', 'directory', 'pattern', 'default', 'partials'];

/**
 * Metalsmith plugin to run files through any layout in a layout `dir`.
 *
 * @param {String or Object} options
 *   @property {String} default (optional)
 *   @property {String} directory (optional)
 *   @property {String} engine
 *   @property {String} pattern (optional)
 *   @property {String or Object} partials (optional)
 * @return {Function}
 */

function plugin(opts){
  opts = opts || {};
  if ('string' == typeof opts) opts = { engine: opts };
  if (!opts.engine) throw new Error('"engine" option required');

  var engine = opts.engine;
  var dir = opts.directory || 'layouts';
  var pattern = opts.pattern;
  var def = opts.default;
  var params = omit(opts, settings);

  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata();

    function check(file){
      var data = files[file];
      var lyt = data.layout || def;
      if (pattern && !match(file, pattern)[0]) return false;
      if (!lyt) return false;
      return true;
    }

    function partials() {
      if(!opts.partials) return [];
      if(typeof opts.partials != 'string') return opts.partials;
      var partialsDir = metalsmith.path(opts.partials);
      var partials = {};

      function readdir(subdir, prefix) {
        var files = fs.readdirSync(subdir);
        if(!Array.isArray(files))
          throw new Error('Partial directory "' + partialsDir + '" could not be read.');

        files.forEach(function(file) {
          if(!fs.lstatSync(subdir + '/' + file).isDirectory()) {
            var templateName = file.substr(0, file.lastIndexOf('.'));
            var relativePath = path.relative(metalsmith.path(dir), subdir);
            partials[prefix + templateName] = relativePath + '/' + templateName;
          } else {
            readdir(subdir + '/' + file, file + '/');
          }
        });
      }

      readdir(partialsDir, '');
      return partials;
    }

    Object.keys(files).forEach(function(file){
      if (!check(file)) return;
      debug('stringifying file: %s', file);
      var data = files[file];
      data.contents = data.contents.toString();
    });

    each(Object.keys(files), convert, done);

    function convert(file, done){
      if (!check(file)) return done();
      debug('converting file: %s', file);
      var data = files[file];
      var clone = extend({}, params, metadata, data, {
        partials: partials()
      });
      var str = metalsmith.path(dir, data.layout || def);
      var render = consolidate[engine];

      render(str, clone, function(err, str){
        if (err) return done(err);
        data.contents = new Buffer(str);
        debug('converted file: %s', file);
        done();
      });
    }
  };
}
