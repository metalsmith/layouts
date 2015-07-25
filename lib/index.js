var consolidate = require('consolidate');
var debug = require('debug')('metalsmith-layouts');
var each = require('async').each;
var extend = require('extend');
var match = require('multimatch');
var omit = require('lodash.omit');
var utf8 = require('is-utf8');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Settings.
 */

var settings = ['engine', 'directory', 'pattern', 'default'];

/**
 * Metalsmith plugin to run files through any layout in a layout `dir`.
 *
 * @param {String or Object} options
 *   @property {String} default (optional)
 *   @property {String} directory (optional)
 *   @property {String} engine
 *   @property {String} pattern (optional)
 * @return {Function}
 */

function plugin(opts){
  opts = opts || {};
  if (typeof opts === 'string') opts = { engine: opts };
  if (!opts.engine) throw new Error('"engine" option required');

  var engine = opts.engine;
  var dir = opts.directory || 'layouts';
  var pattern = opts.pattern;
  var def = opts.default;
  var params = omit(opts, settings);

  // Throw an error for unsupported engines or typos
  if (!consolidate[engine]) throw new Error('Unknown template engine: "' + engine + '"');

  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata();
    var matches = {};

    function check(file){
      var data = files[file];
      var lyt = data.layout || def;
      if (!utf8(data.contents)) return false;
      if (pattern && !match(file, pattern)[0]) return false;
      if (!lyt) return false;
      return true;
    }

    Object.keys(files).forEach(function(file){
      if (!check(file)) return;
      debug('stringifying file: %s', file);
      var data = files[file];
      data.contents = data.contents.toString();
      matches[file] = data;
    });

    each(Object.keys(matches), convert, done);

    function convert(file, done){
      debug('converting file: %s', file);
      var data = files[file];
      var clonedParams = extend(true, {}, params);
      var clone = extend({}, clonedParams, metadata, data);
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
