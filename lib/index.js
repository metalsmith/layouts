/**
 * Dependencies
 */
var consolidate = require('consolidate');
var debug = require('debug')('metalsmith-layouts');
var each = require('async').each;
var extend = require('extend');
var omit = require('lodash.omit');

/**
 * Helpers
 */
var check = require('./helpers/check');

/**
 * Expose `plugin`.
 */
module.exports = plugin;

/**
 * Settings
 *
 * Options supported by metalsmith-layouts
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
  /**
   * Init
   */
  opts = opts || {};

  // Accept string option to specify the engine
  if (typeof opts === 'string') {
    opts = {engine: opts};
  }

  // An engine should be specified
  if (!opts.engine) {
    throw new Error('"engine" option required');
  }

  // Throw an error for unsupported engines or typos
  if (!consolidate[opts.engine]) {
    throw new Error('Unknown template engine: "' + opts.engine + '"');
  }

  // Map options to local variables
  var engine = opts.engine;
  var dir = opts.directory || 'layouts';
  var pattern = opts.pattern;
  var def = opts.default;

  // Move all unrecognised options to params
  var params = omit(opts, settings);

  /**
   * Main plugin function
   */
  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata();
    var matches = {};

    /**
     * Stringify files that pass the check, and store in matches
     */
    Object.keys(files).forEach(function(file){
      if (!check(files, file, pattern)) {
        return;
      }

      debug('stringifying file: %s', file);
      var data = files[file];
      data.contents = data.contents.toString();
      matches[file] = data;
    });

    /**
     * Render files
     */
    function convert(file, done){
      debug('converting file: %s', file);
      var data = files[file];

      // Deep clone params (by passing 'true')
      var clonedParams = extend(true, {}, params);
      var clone = extend({}, clonedParams, metadata, data);
      var str = metalsmith.path(dir, data.layout || def);
      var render = consolidate[engine];

      render(str, clone, function(err, str){
        if (err) {
          return done(err);
        }

        data.contents = new Buffer(str);
        debug('converted file: %s', file);
        done();
      });
    }

    /**
     * Render all matched files
     */
    each(Object.keys(matches), convert, done);
  };
}
