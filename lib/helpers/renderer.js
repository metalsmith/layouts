/**
 * Dependencies
 */
var consolidate = require('consolidate');

/**
 * Expose `renderer`
 */
module.exports = renderer;

/**
 * Helper for creating a render function.
 *
 * @param {String} engine
 * @return {Function}
 */
function renderer (engine) {
  if (!consolidate[engine]) {
    throw new Error('Unknown template engine: "' + engine + '"');
  }

  var render = consolidate[engine];

  /**
   * A function that renders a layout
   *
   * @param {String} engine
   * @return {Function}
   */
  return function renderFn (layoutPath, params, done) {
    render(layoutPath, params, function(err, result) {
      if (err) {
        return done(err);
      }

      done(err, result);
    });
  }
}
