import { isAbsolute, sep, dirname, basename, join } from 'node:path'
import jstransformer from 'jstransformer'

/**
 * Parse a filepath into dirname, base & extensions
 * @param {string} filename
 */
export function parseFilepath(filename) {
  const isNested = filename.includes(sep)
  const dir = isNested ? dirname(filename) : ''
  const [base, ...extensions] = basename(filename).split('.')
  return { dirname: dir, base, extensions }
}

/**
 * @param {string} filename
 * @param {string} extname
 * @returns {string}
 */
export function handleExtname(filename, extname) {
  const { dirname, base, extensions } = parseFilepath(filename)
  const e = extname && extname.slice(1)

  if (!e || e !== extensions[extensions.length - 1]) {
    extensions.pop()
    if (e) extensions.push(e)
  }

  return [join(dirname, base), ...extensions].join('.')
}

/**
 * Get a transformer by name ("jstransformer-ejs"), shortened name ("ejs") or filesystem path
 * @param {string|import('./index').JsTransformer} namePathOrTransformer
 * @param {import('metalsmith').Debugger} debug
 * @returns {Promise<import('./index').JsTransformer>}
 */
export function getTransformer(namePathOrTransformer, debug) {
  let transform = null
  const t = namePathOrTransformer
  const tName = t
  const tPath = t

  // let the jstransformer constructor throw errors
  if (typeof t !== 'string') {
    transform = Promise.resolve(t)
  } else {
    if (isAbsolute(tPath) || tPath.startsWith('.') || tName.startsWith('jstransformer-')) {
      debug('Importing transformer: %s', tPath)
      transform = import(tPath).then((t) => t.default)
    } else {
      debug('Importing transformer: jstransformer-%s', tName)
      // suppose a shorthand where the jstransformer- prefix is omitted, more likely
      transform = import(`jstransformer-${tName}`)
        .then((t) => t.default)
        .catch(() => {
          // else fall back to trying to import the name
          debug.warn('"jstransformer-%s" not found, trying "%s" instead', tName, tName)
          return import(tName).then((t) => t.default)
        })
    }
  }
  return transform.then(jstransformer)
}
