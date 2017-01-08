/**
 * Dependencies
 */
var match = require('multimatch');
var utf8 = require('is-utf8');
var every = require('lodash.every');

/**
 * Expose `check`
 */
module.exports = check;

/**
 * Helper for checking whether a file should be processed.
 *
 * @param {Object} files
 * @param {String} file
 * @param {String|RegExp|Object} pattern
 * @return {Boolean}
 */
function check(files, file, pattern, def){
  if (typeof pattern === 'string' || pattern instanceof RegExp) {
    pattern = { path: pattern };
  }
  var pass;
  var data = Object.assign({}, files[file], { path: file });

  // Only process utf8 encoded files (so no binary)
  if (!utf8(data.contents)) {
    return false;
  }

  // Allow default template to be cancelled by layout: false
  if (data.layout === false) {
    return false;
  }

  pass = every(pattern, function (mask, property) {
    if (!data.hasOwnProperty(property)) {
      return false;
    }
    if (mask instanceof RegExp) {
      return mask.test(data[property]);
    }
    // path property can use RegExp or multimatch
    if (property == 'path') {
      return match(data[property], mask).length;
    }
    // handy usage error
    throw new Error([
      'Only pattern.path can be a multimatch string. ',
      'Other properties like "' + property + '" must be a RegExp'
    ].join(''));
  })

  return pass ? data.layout || def : false;
}
