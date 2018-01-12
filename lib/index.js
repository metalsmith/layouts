const match = require('multimatch');
const path = require('path');
const isUtf8 = require('is-utf8');
const jstransformer = require('jstransformer');
const toTransformer = require('inputformat-to-jstransformer');

/**
 * Gets jstransformer for an extension, and caches them
 */

const cache = {};

function getTransformer(ext) {
  if (ext in cache) {
    return cache[ext];
  }

  const transformer = toTransformer(ext);
  cache[ext] = transformer ? jstransformer(transformer) : false;

  return cache[ext];
}

/**
 * Resolves layouts, in the following order:
 * 1. Layouts in the frontmatter
 * 2. Skips file if layout: false in frontmatter
 * 3. Default layout in the settings
 */

function getLayout({ file, settings }) {
  if (file.layout || file.layout === false) {
    return file.layout;
  }

  return settings.default;
}

/**
 * Engine, renders file with the appropriate layout
 */

function render({ file, metadata, settings, metalsmith }) {
  return new Promise(resolve => {
    const layout = getLayout({ file, settings });
    const extension = layout.split('.').pop();

    // Stringify file contents
    let contents = file.contents.toString();

    const transform = getTransformer(extension);
    const locals = Object.assign({}, metadata, file, { contents });
    const layoutPath = path.join(metalsmith.path(settings.directory), layout);

    // Transform the contents
    contents = transform.renderFile(layoutPath, settings.engineOptions, locals).body;

    // Update file with results
    // eslint-disable-next-line no-param-reassign
    file.contents = Buffer.from(contents);
    return resolve();
  });
}

/**
 * Validate, checks whether a file should be processed
 */

function validate({ file, settings }) {
  const layout = getLayout({ file, settings });

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
 * Plugin, the main plugin used by metalsmith
 */

module.exports = options => (files, metalsmith, done) => {
  const metadata = metalsmith.metadata();
  const defaults = {
    pattern: '**',
    directory: 'layouts',
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
