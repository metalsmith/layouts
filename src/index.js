import path from 'path'
import isUtf8 from 'is-utf8'
import { getTransformer } from './utils.js'

/* c8 ignore next 3 */
let debug = () => {
  throw new Error('uninstantiated debug')
}

/**
 * @callback Render
 * @param {string} source
 * @param {Object} options
 * @param {Object} locals
 * @returns {string}
 */

/**
 * @callback RenderAsync
 * @param {string} source
 * @param {Object} options
 * @param {Object} locals
 * @param {Function} callback
 * @returns {Promise<string>}
 */

/**
 * @callback Compile
 * @param {string} source
 * @param {Object} options
 * @returns {string}
 */

/**
 * @callback CompileAsync
 * @param {string} source
 * @param {Object} options
 * @param {Function} callback
 * @returns {Promise<string>}
 */

/**
 * @typedef {Object} JsTransformer
 * @property {string} name
 * @property {string[]} inputFormats
 * @property {string} outputFormat
 * @property {Render} [render]
 * @property {RenderAsync} [renderAsync]
 * @property {Compile} [compile]
 * @property {CompileAsync} [compileAsync]
 */

/**
 * @typedef {Object} Options `@metalsmith/layouts` options
 * @property {string|JsTransformer} transform Jstransformer to run: name of a node module or local JS module path (starting with `.`) whose default export is a jstransformer. As a shorthand for existing transformers you can remove the `jstransformer-` prefix: `marked` will be understood as `jstransformer-marked`. Or an actual jstransformer; an object with `name`, `inputFormats`,`outputFormat`, and at least one of the render methods `render`, `renderAsync`, `compile` or `compileAsync` described in the [jstransformer API docs](https://github.com/jstransformers/jstransformer#api)
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
 * 3. Default layout in the options
 */

function getLayout({ file, options }) {
  if (file.layout || file.layout === false) {
    return file.layout
  }

  return options.default
}

/**
 * Set default options based on jstransformer `transform`
 * @param {JsTransformer} transform
 * @returns {Options}
 */
function normalizeOptions(options, transform) {
  return {
    default: null,
    pattern: '**',
    directory: 'layouts',
    engineOptions: {},
    suppressNoFilesError: false,
    ...options,
    transform
  }
}

/**
 * Engine, renders file with the appropriate layout
 */

function render({ filename, files, metalsmith, options, transform }) {
  const file = files[filename]
  const layout = getLayout({ file, options })

  debug.info('Rendering "%s" with layout "%s"', filename, layout)

  const metadata = metalsmith.metadata()
  // Stringify file contents
  const contents = file.contents.toString()

  const locals = { ...metadata, ...file, contents }
  const layoutPath = path.join(metalsmith.path(options.directory), layout)

  // Transform the contents
  return transform
    .renderFileAsync(layoutPath, options.engineOptions, locals)
    .then((rendered) => {
      // Update file with results
      file.contents = Buffer.from(rendered.body)
      debug.info('Done rendering "%s"', filename)
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

function validate({ filename, files, options }) {
  const file = files[filename]
  const layout = getLayout({ file, options })

  debug.info(`Validating ${filename}`)

  // Files without a layout cannot be processed
  if (!layout) {
    debug.warn('Validation failed, "%s" does not have a layout set', filename)
    return false
  }

  // Layouts without an extension cannot be processed
  if (!layout.includes('.')) {
    debug.warn('Validation failed, layout for "%s" does not have an extension', filename)
    return false
  }

  // Files that are not utf8 are ignored
  if (!isUtf8(file.contents)) {
    debug.warn('Validation failed, "%s" is not utf-8', filename)
    return false
  }

  // Layouts with an extension mismatch are ignored
  const extension = layout.split('.').pop()
  let inputFormats = options.transform.inputFormats
  if (!Array.isArray(inputFormats)) inputFormats = [options.transform.inputFormats]

  if (!inputFormats.includes(extension)) {
    debug.warn('Validation failed, layout for "%s" does not have an extension', filename)
    return false
  }

  return true
}

/**
 * A metalsmith plugin for rendering layouts
 * @param {Options} options
 * @returns {import('metalsmith').Plugin}
 */
function layouts(options) {
  let transform

  return async function layouts(files, metalsmith, done) {
    debug = metalsmith.debug('@metalsmith/layouts')

    if (!options.transform) {
      done(new Error('"transform" option is required'))
      return
    }

    // Check whether the pattern option is valid
    if (
      options.pattern &&
      !(typeof options.pattern === 'string' || Array.isArray(options.pattern))
    ) {
      return done(
        new Error('invalid pattern, the pattern option should be a string or array of strings.')
      )
    }

    // skip resolving the transform option on repeat runs
    if (!transform) {
      try {
        transform = await getTransformer(options.transform, debug)
      } catch (err) {
        // pass through jstransformer & Node import resolution errors
        return done(err)
      }
    }

    options = normalizeOptions(options, transform)

    debug('Running with options %O', options)

    const matchedFiles = metalsmith.match(options.pattern, Object.keys(files))

    // Filter files by validity, pass basename to avoid dots in folder path
    const validFiles = matchedFiles.filter((filename) => validate({ filename, files, options }))

    // Let the user know when there are no files to process, unless the check is suppressed
    if (validFiles.length === 0) {
      const message =
        'no files to process. See https://www.npmjs.com/package/@metalsmith/layouts#suppressnofileserror'

      if (options.suppressNoFilesError) {
        debug.error(message)
        return done()
      }

      return done(new Error(message))
    }

    // Map all files that should be processed to an array of promises and call done when finished
    return Promise.all(
      validFiles.map((filename) => render({ filename, files, metalsmith, options, transform }))
    )
      .then(() => {
        debug('Finished rendering %s file%s', validFiles.length, validFiles.length > 1 ? 's' : '')
        done()
      })
      .catch(done)
  }
}

// ensures non-breaking change:
// import { getTransformer } from '@metalsmith/layouts' instead of
// import getTransformer from '@metalsmith/layouts/get-transformer'
layouts.getTransformer = getTransformer
export default layouts
