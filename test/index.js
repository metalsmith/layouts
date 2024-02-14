/* eslint-env node, mocha */

import Metalsmith from 'metalsmith'
import equal from 'assert-dir-equal'
import path from 'path'
import { rejects, strictEqual } from 'assert'
import plugin from '../src/index.js'

function fixture(dir) {
  dir = path.resolve('./test/fixtures', dir)
  return {
    dir,
    expected: path.resolve(dir, 'expected'),
    actual: path.resolve(dir, 'build')
  }
}

describe('@metalsmith/layouts', () => {
  it('should apply a single layout to a single file', async () => {
    const { dir, actual, expected } = fixture('single-file')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .build()

    equal(actual, expected)
  })

  it('should apply a single layout to a single file with an async jstransformer', async () => {
    const { dir, actual, expected } = fixture('single-file-async')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'qejs' }))
      .build()

    equal(actual, expected)
  })

  it('should apply a single layout to multiple files', async () => {
    const { dir, actual, expected } = fixture('multiple-files')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .build()

    equal(actual, expected)
  })

  it('should apply multiple layouts to multiple files', async () => {
    const { dir, actual, expected } = fixture('multiple-files-and-layouts')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .build()

    equal(actual, expected)
  })

  it('should apply a default layout', async () => {
    const { dir, actual, expected } = fixture('default-layout')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars', default: 'standard.hbs' }))
      .build()

    equal(actual, expected)
  })

  it('should override a default layout', async () => {
    const { dir, actual, expected } = fixture('override-default-layout')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars', default: 'standard.hbs' }))
      .build()

    equal(actual, expected)
  })

  it('should apply a string pattern', async () => {
    const { dir, actual, expected } = fixture('string-pattern')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars', pattern: 'match.html' }))
      .build()

    equal(actual, expected)
  })

  it('should apply an array of string patterns', async () => {
    const { dir, actual, expected } = fixture('array-pattern')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars', pattern: ['match.html', 'also.html'] }))
      .build()

    equal(actual, expected)
  })

  it('should ignore binary files', async () => {
    const { dir, actual, expected } = fixture('ignore-binary')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars', default: 'standard.hbs' }))
      .build()

    equal(actual, expected)
  })

  it('should accept an alternate directory for layouts', async () => {
    const { dir, actual, expected } = fixture('directory')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars', directory: 'templates' }))
      .build()

    equal(actual, expected)
  })

  it('should process variables from the frontmatter', async () => {
    const { dir, actual, expected } = fixture('variables')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .build()

    equal(actual, expected)
  })

  it('should process variables from the metadata', async () => {
    const { dir, actual, expected } = fixture('metadata')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .metadata({ text: 'Some text' })
      .use(plugin({ transform: 'handlebars' }))
      .build()

    equal(actual, expected)
  })

  it('should override variables from the metadata with local ones', async () => {
    const { dir, actual, expected } = fixture('override-metadata')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .metadata({ text: 'Some text' })
      .use(plugin({ transform: 'handlebars' }))
      .build()

    equal(actual, expected)
  })

  it('should return an error when there are no valid files to process', async () => {
    const { dir } = fixture('no-files')
    rejects(
      async () => {
        await Metalsmith(dir).env('DEBUG', process.env.DEBUG).use(plugin()).build()
      },
      { message: 'no files to process.' }
    )
  })

  it('should return an error for an invalid pattern', async () => {
    const { dir } = fixture('invalid-pattern')
    rejects(
      async () => {
        await Metalsmith(dir)
          .env('DEBUG', process.env.DEBUG)
          .use(plugin({ pattern: () => {} }))
          .build()
      },
      { message: 'invalid pattern, the pattern option should be a string or array of strings.' }
    )
  })

  it('should ignore layouts without an extension', async () => {
    const { dir, actual, expected } = fixture('ignore-invalid-layout')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .build()

    equal(actual, expected)
  })

  it('should ignore layouts without a jstransformer', async () => {
    const { dir, actual, expected } = fixture('ignore-layout-without-jstransformer')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .build()

    equal(actual, expected)
  })

  it('should allow default layouts to be disabled from the frontmatter', async () => {
    const { dir, actual, expected } = fixture('override-default')
    await Metalsmith(dir)
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars', default: 'standard.hbs' }))
      .build()

    equal(actual, expected)
  })

  it('should prefix rendering errors with the filename', async () => {
    const { dir } = fixture('rendering-error')
    try {
      await Metalsmith(dir)
        .env('DEBUG', process.env.DEBUG)
        .use(plugin({ transform: 'handlebars' }))
        .build()
    } catch (err) {
      strictEqual(err.message.slice(0, 'index.html'.length + 1), 'index.html:')
    }
  })
})
