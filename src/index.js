import createDebug from 'debug'
import path from 'path'
import isUtf8 from 'is-utf8'
import getTransformer from './get-transformer'

const debug = createDebug('@metalsmith/layouts')

/**
 * `@metalsmith/layouts` options
 * @typedef {Object} Options
 * @property {string} [default] A default layout to apply to files, eg `default.njk`.
 * @property {string} [pattern] The directory for the layouts. The default is `layouts`.
 * @property {string|string[]} [directory] Only files that match this pattern will be processed. Accepts a string or an array of strings. The default is `**` (all).
 * @property {Object} [engineOptions] Pass options to [the jstransformer](https://github.com/jstransformers/jstransformer) that's rendering your layouts. The default is `{}`.
 * @property {boolean} [suppressNoFilesError] By default `@metalsmith/layouts` will exit with an error if there aren't any files to process. Enabling this option will suppress that error.
 */

/**
 * Resolves layouts, in the following order:
 * 1. Layouts in the frontmatter
 * 2. Skips file if layout: false in frontmatter
 * 3. Default layout in the settings
 */

function getLayout({ file, settings }) {
  if (file.layout || file.layout === false) {
    return file.layout
  }

  return settings.default
}

/**
 * Engine, renders file with the appropriate layout
 */

function render({ filename, files, metadata, settings, metalsmith }) {
  const file = files[filename]
  const layout = getLayout({ file, settings })
  const extension = layout.split('.').pop()

  debug(`rendering ${filename} with layout ${layout}`)

  // Stringify file contents
  const contents = file.contents.toString()

  const transform = getTransformer(extension)
  const locals = { ...metadata, ...file, contents }
  const layoutPath = path.join(metalsmith.path(settings.directory), layout)

  // Transform the contents
  return transform
    .renderFileAsync(layoutPath, settings.engineOptions, locals)
    .then((rendered) => {
      // Update file with results
      file.contents = Buffer.from(rendered.body)
      debug(`done rendering ${filename}`)
    })
    .catch((err) => {
      // Prepend error message with file path
      err.message = `${filename}: ${err.message}`
      throw err
    })
}

/**
 * Validate, checks whether a file should be processed
 */

function validate({ filename, files, settings }) {
  const file = files[filename]
  const layout = getLayout({ file, settings })

  debug(`validating ${filename}`)

  // Files without a layout cannot be processed
  if (!layout) {
    debug(`validation failed, ${filename} does not have a layout set`)
    return false
  }

  // Layouts without an extension cannot be processed
  if (!layout.includes('.')) {
    debug(`validation failed, layout for ${filename} does not have an extension`)
    return false
  }

  // Files that are not utf8 are ignored
  if (!isUtf8(file.contents)) {
    debug(`validation failed, ${filename} is not utf-8`)
    return false
  }

  // Files without an applicable jstransformer are ignored
  const extension = layout.split('.').pop()
  const transformer = getTransformer(extension)

  if (!transformer) {
    debug(`validation failed, no jstransformer found for layout for ${filename}`)
  }

  return transformer
}

/**
 * A metalsmith plugin for rendering layouts
 * @param {Options} options
 * @returns {import('metalsmith').Plugin}
 */
function initLayouts(options) {
  return function layouts(files, metalsmith, done) {
    const metadata = metalsmith.metadata()
    const defaults = {
      pattern: '**',
      directory: 'layouts',
      engineOptions: {},
      suppressNoFilesError: false
    }
    const settings = { ...defaults, ...options }

    // Check whether the pattern option is valid
    if (!(typeof settings.pattern === 'string' || Array.isArray(settings.pattern))) {
      return done(
        new Error(
          'invalid pattern, the pattern option should be a string or array of strings. See https://www.npmjs.com/package/@metalsmith/layouts#pattern'
        )
      )
    }

    // Filter files by the pattern
    const matchedFiles = metalsmith.match(settings.pattern, Object.keys(files))

    // Filter files by validity
    const validFiles = matchedFiles.filter((filename) => validate({ filename, files, settings }))

    // Let the user know when there are no files to process, unless the check is suppressed
    if (validFiles.length === 0) {
      const message =
        'no files to process. See https://www.npmjs.com/package/@metalsmith/layouts#suppressnofileserror'

      if (settings.suppressNoFilesError) {
        debug(message)
        return done()
      }

      return done(new Error(message))
    }

    // Map all files that should be processed to an array of promises and call done when finished
    return Promise.all(
      validFiles.map((filename) => render({ filename, files, metadata, settings, metalsmith }))
    )
      .then(() => done())
      .catch(/* istanbul ignore next */ (error) => done(error))
  }
}

// ensures non-breaking change:
// import { getTransformer } from '@metalsmith/layouts' instead of
// import getTransformer from '@metalsmith/layouts/get-transformer'
export { getTransformer }
export default initLayouts
