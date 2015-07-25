
var consolidate = require('consolidate');
var debug = require('debug')('metalsmith-layouts');
var each = require('async').each;
var extend = require('extend');
var match = require('multimatch');
var omit = require('lodash.omit');

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

function plugin(opts) {
  opts = opts || {};
  if ('string' == typeof opts) opts = { engine: opts };
  if (!opts.engine) throw new Error('"engine" option required');

  var engine = opts.engine;
  var dir = opts.directory || 'layouts';
  var pattern = opts.pattern;
  var def = opts.default;
  var params = omit(opts, settings);

  return function(files, metalsmith, done) {
    var layouts = {
      _metadata: {},
      _engine: opts.engine,

      /**
       * Consolidate template engine instance
       */
      consolidate: consolidate,

      /**
       * Resolve paths relative to the layouts directory.
       */
      path: function() {
        var paths = [].slice.call(arguments);
        paths.unshift(dir);
        return metalsmith.path.apply(metalsmith, paths);
      },

      /**
       * Register metadata for consolidate engine.
       */
      register: function(key, value) {
        this._metadata[key] = value;
      },

      /**
       * Returns the metadata sent to the consolidate engine.
       */
      get metadata() {
        return this._metadata;
      },

      /**
       * Returns the template engie render function.
       */
      get engine() {
        return this.consolidate[this._engine];
      },

      /**
       * Manually pre-set an instance of the template engine.
       */
      set engine(instance) {
        layouts.consolidate.requires[this._engine] = instance;
      }
    },

    metadata = metalsmith.metadata();

    function check(file){
      var data = files[file];
      var lyt = data.layout || def;
      if (pattern && !match(file, pattern)[0]) return false;
      if (!lyt) return false;
      return true;
    }

    function convert(file, done) {
      if (!check(file))
        return done();

      debug('converting file: %s', file);
      var data = files[file];
      var clone = extend({}, params, metadata, data, layouts.metadata);
      var str = metalsmith.path(dir, data.layout || def);

      var render = layouts.engine;

      render(str, clone, function(err, str){
        if (err)
          return done(err);

        data.contents = new Buffer(str);
        debug('converted file: %s', file);
        done();
      });
    }

    // Load template engine extensions
    try {
      var extension = require('./extensions/' + engine);
    } catch(e) {
      debug('engine "%s" has not extensions', engine);
    }
    extension && extension(layouts, opts);

    //console.log(layouts.metadata);

    Object.keys(files).forEach(function(file){
      if (!check(file)) return;
      debug('stringifying file: %s', file);
      var data = files[file];
      data.contents = data.contents.toString();
    });

    each(Object.keys(files), convert, done);
  };
}
