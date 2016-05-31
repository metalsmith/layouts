/**
 * Dependencies
 */
var path = require('path');
var fs   = require('fs');
var read = require('fs-readdir-recursive');

/**
 * Expose `readPartials`
 */
module.exports = readPartials;

/**
 * Helper for reading a folder with partials, returns a `partials` object that
 * can be consumed by consolidate.
 *
 * @param {String} partialsPath
 * @param {String} partialsFallback
 * @param {Object} metalsmith
 * @return {Object}
 */
function readPartials(partialsPath, partialsFallback, metalsmith) {

  var partialsAbs = path.isAbsolute(partialsPath) ? partialsPath : path.join(metalsmith.path(), partialsPath);

  var files = read(partialsAbs);

  if (typeof partialsFallback === 'string') {
    var partialsFallbackAbs = path.isAbsolute(partialsFallback) ? partialsFallback : path.join(metalsmith.path(), partialsFallback);
    files = files.concat(read(partialsFallbackAbs))
  }

  var partials = {};

  // Return early if there are no partials
  if (files.length === 0) {
    return partials;
  }

  // Read and process all partials
  for (var i = 0; i < files.length; i++) {
    var fileInfo   = path.parse(files[i]);
    var name       = path.join(fileInfo.dir, fileInfo.name);
    var partialAbs = path.join(partialsAbs, name);

    if (typeof partialsFallback === 'string') {
      try {
        fs.accessSync(partialAbs + fileInfo.ext, fs.R_OK);
      } catch (e) {
        partialAbs = path.join(partialsFallbackAbs, name);
      }
    }

    partials[name.replace(/\\/g, '/')] = partialAbs;
  }

  return partials;
}
