
var consolidate = require('consolidate');
var debug = require('debug')('metalsmith-templates');
var each = require('async').each;
var extend = require('extend');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to run files through any template in a template `dir`.
 *
 * @param {String} dir
 * @return {Function}
 */

function plugin(opts){
  opts = opts || {};
  opts.dir = opts.dir || 'templates';
  if (!opts.engine) throw new Error('"engine" option required');

  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata();

    each(Object.keys(files), convert, done);

    function convert(file, done){
      debug('checking file: %s', file);
      var data = files[file];
      if (!data.template) return done();

      debug('converting file: %s', file);
      data.contents = data.contents.toString();
      var tmpl = metalsmith.join(opts.dir, data.template);
      var clone = extend({}, metadata, data);

      consolidate[opts.engine](tmpl, clone, function(err, str){
        if (err) return done(err);
        data.contents = new Buffer(str);
        debug('converted file: %s', file);
        done();
      });
    }
  };
}