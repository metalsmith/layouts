import { extname, join } from 'path'
import isUtf8 from 'is-utf8'
import { getTransformer, handleExtname } from './utils.js'

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
 * @property {string} [default=null] A default layout to apply to files, eg `default.njk`.
 * @property {string|string[]} [pattern='**'] Only files that match this pattern will be processed. Accepts a string or an array of strings. The default is `**` (all).
 * @property {string} [directory='layouts'] The directory for the layouts. The default is `layouts`.
 * @property {Object} [engineOptions] Pass options to [the jstransformer](https://github.com/jstransformers/jstransformer) that's rendering your layouts. The default is `{}`.
 * @property {string} [extname] Pass `''` to remove the extension or `'.<extname>'` to keep or rename it. By default the extension is kept
 */

/**
 * Set default options based on jstransformer `transform`
 * @param {JsTransformer} transform
 * @returns {Options}
 */
function normalizeOptions(options, transform) {
  const inputFormats = Array.isArray(transform.inputFormats)
    ? transform.inputFormats
    : [transform.inputFormats]
  return {
    default: null,
    pattern: `**/*.{${inputFormats.join(',')}}`,
    directory: 'layouts',
    engineOptions: {},
    extname: `.${transform.outputFormat}`,
    ...options,
    transform: {
      ...transform,
      inputFormats
    }
  }
}

/**
 * Engine, renders file with the appropriate layout
 */

function render({ filename, files, metalsmith, options, transform }) {
  const file = files[filename]

  debug.info('Rendering "%s" with layout "%s"', filename, file.layout)

  const metadata = metalsmith.metadata()
  // Stringify file contents
  const contents = file.contents.toString()

  const locals = { ...metadata, ...file, contents }
  const layoutPath = join(metalsmith.path(options.directory), file.layout)

  // Transform the contents
  return transform
    .renderFileAsync(layoutPath, options.engineOptions, locals)
    .then((rendered) => {
      debug('Done rendering "%s"', filename)

      // move file if necessary
      const newName = handleExtname(filename, options.extname)
      if (newName !== filename) {
        debug('Renaming "%s" to "%s"', filename, newName)
        delete files[filename]
        files[newName] = file
      }
      // Update file with results
      file.contents = Buffer.from(rendered.body)
    })
    .catch((err) => {
      // Prepend error message with file path
      err.message = `${filename}: ${err.message}`
      throw err
    })
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

    let matches = metalsmith.match(options.pattern, Object.keys(files))

    // skip non-utf8 & invalid layout files
    matches = matches.filter((fpath) => {
      const f = files[fpath]
      const absPath = metalsmith.path(fpath)
      if (!isUtf8(f.contents)) {
        debug.warn('Skipping file "%s": non utf-8 content', absPath)
        return false
      }
      if (!f.layout) {
        if (options.default && !Reflect.has(f, 'layout')) {
          f.layout = options.default
          return true
        }
        debug.warn(
          'Skipping file "%s": %s',
          absPath,
          f.layout === false ? 'layout: false' : 'layout: undefined'
        )
        return false
      } else if (!options.transform.inputFormats.includes(extname(f.layout).slice(1))) {
        debug.info(
          'Skipping file "%s": layout "%s" does not match inputFormats ["%s"]',
          absPath,
          f.layout,
          options.transform.inputFormats.join(', ')
        )
        return false
      }
      return true
    })

    // allow omitting the .<ext> part of a layout if it matches transform.inputFormats[0]
    matches.forEach((fpath) => {
      const f = files[fpath]
      debug(f.layout)
      if (!extname(f.layout)) {
        f.layout = `${f.layout}.${options.transform.inputFormats[0]}`
      }
    })

    // Let the user know when there are no files to process
    if (!matches.length) {
      debug.warn('No valid files to process.')
      return done()
    }

    // Map all files that should be processed to an array of promises and call done when finished
    return Promise.all(
      matches.map((filename) => render({ filename, files, metalsmith, options, transform }))
    )
      .then(() => {
        debug('Done rendering %s file%s', matches.length, matches.length > 1 ? 's' : '')
        done()
      })
      .catch(done)
  }
}

export default layouts
