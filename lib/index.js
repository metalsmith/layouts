
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
      debug('converting file: %s', file);
      var data = extend({}, metadata, files[file]);
      var template = data.template;
      if (!template) return done();
      var tmpl = metalsmith.join(opts.dir, template);
      debug('stringify file: %s', file);
      data.contents = data.contents.toString();
      consolidate[opts.engine](tmpl, data, function(err, str){
        if (err) return done(err);
        debug('converted file: %s', file);
        files[file].contents = new Buffer(str);
        done();
      });
    }
  };
}