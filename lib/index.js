
var consolidate = require('consolidate');
var debug = require('debug')('metalsmith-templates');
var each = require('async').each;
var extend = require('extend');
var join = require('path').join;
var match = require('multimatch');
var omit = require('lodash.omit');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to run files through any template in a template `dir`.
 *
 * @param {String or Object} options
 *   @property {String} default (optional)
 *   @property {String} directory (optional)
 *   @property {String} engine
 *   @property {String} inPlace (optional)
 *   @property {String} pattern (optional)
 * @return {Function}
 */

function plugin(opts){
  opts = opts || {};
  if ('string' == typeof opts) opts = { engine: opts };
  if (!opts.engine) throw new Error('"engine" option required');

  var engine = opts.engine;
  var dir = opts.directory || 'templates';
  var pattern = opts.pattern;
  var inPlace = opts.inPlace;
  var def = opts.default;
  var engineparams = omit(opts, [
    'engine', 'directory', 'pattern', 'inPlace', 'default'
  ]);

  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata();

    each(Object.keys(files), convert, done);

    function convert(file, done){
      debug('checking file: %s', file);
      var data = files[file];
      var clone = extend({}, engineparams, metadata, data);
      var tmpl = data.template || def;
      var render;

      if (pattern && !match(file, pattern)[0]) return done();
      if (!inPlace && !tmpl) return done();

      if (inPlace) {
        tmpl = clone.contents.toString();
        render = consolidate[engine].render;
      } else {
        tmpl = metalsmith.join(dir, tmpl);
        render = consolidate[engine];
        clone.contents = clone.contents.toString();
      }

      render(tmpl, clone, function(err, str){
        if (err) return done(err);
        data.contents = new Buffer(str);
        debug('converted file: %s', file);
        done();
      });
    }
  };
}