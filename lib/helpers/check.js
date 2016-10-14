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
 * @param {String} pattern
 * @return {Boolean}
 */
function check(files, file, pattern, filter, def){
  var data = files[file];

  // Only process utf8 encoded files (so no binary)
  if (!utf8(data.contents)) {
    return false;
  }

  // Only process files that match the pattern (if there is a pattern)
  if (
    (pattern && !match(file, pattern)[0]) ||
    (filter && !applyFilter(data, filter))
  ) {
    return false;
  }

  // Only process files with a specified layout or default template. Allow the
  // default template to be cancelled by layout: false.
  return 'layout' in data ? data.layout : def;
}

function applyFilter(data, filter) {
  for (var property in filter) {
    if (!filter.hasOwnProperty(property)) continue;
    if (
      (filter[property] instanceof RegExp) &&
      (filter[property].test(data[property]))
    ) continue
    if (filter[property] === data[property]) continue;
    return false;
  }
  return true;
}
