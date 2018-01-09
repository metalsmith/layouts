const match = require('multimatch');
const getTransformer = require('./get-transformer');
const path = require('path');
const isUtf8 = require('is-utf8');

/**
 * Engine
 */

function render({ file, metadata, settings, metalsmith }) {
  return new Promise(resolve => {
    const layout = file.layout || settings.default;
    const extension = layout.split('.').pop();

    // Stringify file contents
    // eslint-disable-next-line no-param-reassign
    file.contents = file.contents.toString();

    const transform = getTransformer(extension);
    const locals = Object.assign({}, metadata, file);
    const layoutPath = path.join(metalsmith.path(settings.directory), layout);

    // Transform the contents
    // eslint-disable-next-line no-param-reassign
    file.contents = transform.renderFile(layoutPath, settings.engineOptions, locals).body;

    // Update file with results
    // eslint-disable-next-line no-param-reassign
    file.contents = Buffer.from(file.contents);
    return resolve();
  });
}

/**
 * Validate
 */

function validate({ file, settings }) {
  const layout = file.layout || settings.default;

  // Files without a layout cannot be processed
  if (!layout) {
    return false;
  }

  // Layouts without an extension cannot be processed
  if (!layout.includes('.')) {
    return false;
  }

  // Files that are not utf8 are ignored
  if (!isUtf8(file.contents)) {
    return false;
  }

  // Files without an applicable jstransformer are ignored
  const extension = layout.split('.').pop();
  return getTransformer(extension);
}

/**
 * Plugin
 */

module.exports = options => (files, metalsmith, done) => {
  const metadata = metalsmith.metadata();
  const defaults = {
    pattern: '**',
    directory: 'layouts',
    default: false,
    engineOptions: {}
  };
  const settings = Object.assign({}, defaults, options);

  // Check whether the pattern option is valid
  if (!(typeof settings.pattern === 'string' || Array.isArray(settings.pattern))) {
    done(new Error('invalid pattern, the pattern option should be a string or array.'));
  }

  // Filter files by the pattern
  const matchedFiles = match(Object.keys(files), settings.pattern);

  // Filter files by validity
  const validFiles = matchedFiles.filter(filename => validate({ file: files[filename], settings }));

  // Let the user know when there are no files to process, usually caused by missing jstransformer
  if (validFiles.length === 0) {
    done(new Error('no files to process, check whether you have a jstransformer installed.'));
  }

  // Map all files that should be processed to an array of promises and call done when finished
  Promise.all(
    validFiles.map(filename =>
      render({
        file: files[filename],
        metadata,
        settings,
        metalsmith
      })
    )
  )
    .then(() => done())
    .catch(/* istanbul ignore next */ error => done(error));
};
