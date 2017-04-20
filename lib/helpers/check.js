/**
 * Dependencies
 */
var match = require('multimatch');
var utf8 = require('is-utf8');

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
  var data = Object.assign({}, files[file], { path: file });

  if (
    // Only process utf8 encoded files (so no binary)
    (!utf8(data.contents)) ||
    // Allow default template to be cancelled by layout: false
    (data.layout === false) ||
    // No default and no specified template
    (!data.layout && !def)
  ) {
    return false;
  }
  if (!pattern) {
    return true;
  }

  return Object.keys(pattern).every(function (key) {
    if (!data.hasOwnProperty(key)) {
      return false;
    }
    if (pattern[key] instanceof RegExp) {
      return pattern[key].test(data[key]);
    }
    // path property can use RegExp or multimatch
    if (key == 'path') {
      return match(data[key], pattern[key]).length > 0;
    }
  })
}
