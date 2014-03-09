
var consolidate = require('consolidate');
var debug = require('debug')('metalsmith-templates');
var each = require('async').each;
var extend = require('extend');
var join = require('path').join;
var match = require('multimatch');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to run files through any template in a template `dir`.
 *
 * @param {String or Object} options
 *   @property {String} engine
 *   @property {String} pattern (optional)
 *   @property {String} directory (optional)
 * @return {Function}
 */

function plugin(opts){
  opts = opts || {};
  if ('string' == typeof opts) opts = { engine: opts };
  if (!opts.engine) throw new Error('"engine" option required');

  var engine = opts.engine;
  var dir = opts.directory || 'templates';
  var pattern = opts.pattern;

  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata();

    each(Object.keys(files), convert, done);

    function convert(file, done){
      debug('checking file: %s', file);
      var data = files[file];
      var clone = extend({}, metadata, data);
      var tmpl;
      var render;

      debug('converting file: %s', file);
      if (data.template) {
        tmpl = metalsmith.join(dir, data.template);
        render = consolidate[engine];
        clone.contents = clone.contents.toString();
      } else if (match(file, pattern)) {
        tmpl = clone.contents.toString();
        render = consolidate[engine].render;
      } else {
        return done();
      }

      render(tmpl, clone, function(err, str){
        if (err) return done(err);
        data.contents = new Buffer(str);
        debug('converted file: %s', file);
        done();
      });
    }

    /**
     * Resolve the template location for a given `file` with `data`.
     *
     * @param {String} file
     * @param {Object} data
     * @return {String or Null}
     */

    function resolve(file, data){
      if (data.template) return
      if (match(file, pattern)) return
      return null;
    }
  };

}