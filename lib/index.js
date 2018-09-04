const debug = require('debug')('metalsmith-layouts');
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

function render({ filename, files, metadata, settings, metalsmith }) {
  return new Promise(resolve => {
    const file = files[filename];
    const layout = getLayout({ file, settings });
    const extension = layout.split('.').pop();

    debug(`rendering ${filename} with layout ${layout}`);

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

    debug(`done rendering ${filename}`);
    return resolve();
  });
}

/**
 * Validate, checks whether a file should be processed
 */

function validate({ filename, files, settings }) {
  const file = files[filename];
  const layout = getLayout({ file, settings });

  debug(`validating ${filename}`);

  // Files without a layout cannot be processed
  if (!layout) {
    debug(`validation failed, ${filename} does not have a layout set`);
    return false;
  }

  // Layouts without an extension cannot be processed
  if (!layout.includes('.')) {
    debug(`validation failed, layout for ${filename} does not have an extension`);
    return false;
  }

  // Files that are not utf8 are ignored
  if (!isUtf8(file.contents)) {
    debug(`validation failed, ${filename} is not utf-8`);
    return false;
  }

  // Files without an applicable jstransformer are ignored
  const extension = layout.split('.').pop();
  const transformer = getTransformer(extension);

  if (!transformer) {
    debug(`validation failed, no jstransformer found for layout for ${filename}`);
  }

  return transformer;
}

/**
 * Plugin, the main plugin used by metalsmith
 */

module.exports = options => (files, metalsmith, done) => {
  const metadata = metalsmith.metadata();
  const defaults = {
    pattern: '**',
    directory: 'layouts',
    engineOptions: {},
    suppressNoFilesError: false
  };
  const settings = Object.assign({}, defaults, options);

  // Check whether the pattern option is valid
  if (!(typeof settings.pattern === 'string' || Array.isArray(settings.pattern))) {
    done(
      new Error(
        'invalid pattern, the pattern option should be a string or array of strings. See https://www.npmjs.com/package/metalsmith-layouts#pattern'
      )
    );
  }

  // Filter files by the pattern
  const matchedFiles = match(Object.keys(files), settings.pattern);

  // Filter files by validity
  const validFiles = matchedFiles.filter(filename => validate({ filename, files, settings }));

  // Let the user know when there are no files to process, unless the check is suppressed
  if (validFiles.length === 0) {
    const msg =
      'no files to process. See https://www.npmjs.com/package/metalsmith-layouts#no-files-to-process';
    if (settings.suppressNoFilesError) {
      debug(msg);
      done();
    } else {
      done(new Error(msg));
    }
  }

  // Map all files that should be processed to an array of promises and call done when finished
  Promise.all(
    validFiles.map(filename => render({ filename, files, metadata, settings, metalsmith }))
  )
    .then(() => done())
    .catch(/* istanbul ignore next */ error => done(error));
};
