const Metalsmith = require('metalsmith')
const equal = require('assert-dir-equal')
const path = require('path')
/* eslint-disable-next-line n/no-missing-require */
const plugin = require('..')
const { it, describe } = require('mocha')
const { doesNotThrow, strictEqual } = require('assert')
const fixture = path.resolve.bind(process.cwd(), 'test/fixtures')

describe('@metalsmith/layouts', () => {
  it('should apply a single layout to a single file', (done) => {
    Metalsmith(fixture('single-file'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() => equal(fixture('single-file/build'), fixture('single-file/expected')))
        done()
      })
  })

  it('should apply a single layout to a single file with an async jstransformer', (done) => {
    Metalsmith(fixture('single-file-async'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() =>
          equal(fixture('single-file-async/build'), fixture('single-file-async/expected'))
        )
        done()
      })
  })

  it('should apply a single layout to multiple files', (done) => {
    Metalsmith(fixture('multiple-files'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() =>
          equal(fixture('multiple-files/build'), fixture('multiple-files/expected'))
        )
        done()
      })
  })

  it('should apply multiple layouts to multiple files', (done) => {
    Metalsmith(fixture('multiple-files-and-layouts'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() =>
          equal(
            fixture('multiple-files-and-layouts/build'),
            fixture('multiple-files-and-layouts/expected')
          )
        )
        done()
      })
  })

  it('should apply a default layout', (done) => {
    Metalsmith(fixture('default-layout'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ default: 'standard.hbs' }))
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() =>
          equal(fixture('default-layout/build'), fixture('default-layout/expected'))
        )
        done()
      })
  })

  it('should override a default layout', (done) => {
    Metalsmith(fixture('override-default-layout'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ default: 'standard.hbs' }))
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() =>
          equal(
            fixture('override-default-layout/build'),
            fixture('override-default-layout/expected')
          )
        )
        done()
      })
  })

  it('should apply a string pattern', (done) => {
    Metalsmith(fixture('string-pattern'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ pattern: 'match.html' }))
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() =>
          equal(fixture('string-pattern/build'), fixture('string-pattern/expected'))
        )
        done()
      })
  })

  it('should apply an array of string patterns', (done) => {
    Metalsmith(fixture('array-pattern'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ pattern: ['match.html', 'also.html'] }))
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() => equal(fixture('array-pattern/build'), fixture('array-pattern/expected')))
        done()
      })
  })

  it('should ignore binary files', (done) => {
    Metalsmith(fixture('ignore-binary'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ default: 'standard.hbs' }))
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() => equal(fixture('ignore-binary/build'), fixture('ignore-binary/expected')))
        done()
      })
  })

  it('should accept an alternate directory for layouts', (done) => {
    Metalsmith(fixture('directory'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ directory: 'templates' }))
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() => equal(fixture('directory/build'), fixture('directory/expected')))
        done()
      })
  })

  it('should process variables from the frontmatter', (done) => {
    Metalsmith(fixture('variables'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() => equal(fixture('variables/build'), fixture('variables/expected')))
        done()
      })
  })

  it('should process variables from the metadata', (done) => {
    Metalsmith(fixture('metadata'))
      .env('DEBUG', process.env.DEBUG)
      .metadata({ text: 'Some text' })
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() => equal(fixture('metadata/build'), fixture('metadata/expected')))
        done()
      })
  })

  it('should override variables from the metadata with local ones', (done) => {
    Metalsmith(fixture('override-metadata'))
      .env('DEBUG', process.env.DEBUG)
      .metadata({ text: 'Some text' })
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() =>
          equal(fixture('override-metadata/build'), fixture('override-metadata/expected'))
        )
        done()
      })
  })

  it('should return an error when there are no valid files to process', (done) => {
    Metalsmith(fixture('no-files'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin())
      .build((err) => {
        strictEqual(err instanceof Error, true)
        strictEqual(
          err.message,
          'no files to process. See https://www.npmjs.com/package/@metalsmith/layouts#suppressnofileserror'
        )
        done()
      })
  })

  it('should not return an error when there are no valid files to process and suppressNoFilesError is true', (done) => {
    Metalsmith(fixture('no-files'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ suppressNoFilesError: true }))
      .build((err) => {
        strictEqual(err, null)
        done()
      })
  })

  it('should return an error for an invalid pattern', (done) => {
    Metalsmith(fixture('invalid-pattern'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ pattern: () => {} }))
      .build((err) => {
        strictEqual(err instanceof Error, true)
        strictEqual(
          err.message,
          'invalid pattern, the pattern option should be a string or array of strings. See https://www.npmjs.com/package/@metalsmith/layouts#pattern'
        )
        done()
      })
  })

  it('should ignore layouts without an extension', (done) => {
    Metalsmith(fixture('ignore-invalid-layout'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() =>
          equal(fixture('ignore-invalid-layout/build'), fixture('ignore-invalid-layout/expected'))
        )
        done()
      })
  })

  it('should ignore layouts without a jstransformer', (done) => {
    Metalsmith(fixture('ignore-layout-without-jstransformer'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() =>
          equal(
            fixture('ignore-layout-without-jstransformer/build'),
            fixture('ignore-layout-without-jstransformer/expected')
          )
        )
        done()
      })
  })

  it('should allow default layouts to be disabled from the frontmatter', (done) => {
    Metalsmith(fixture('override-default'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ default: 'standard.hbs' }))
      .build((err) => {
        if (err) done(err)
        doesNotThrow(() =>
          equal(fixture('override-default/build'), fixture('override-default/expected'))
        )
        done()
      })
  })

  it('should prefix rendering errors with the filename', (done) => {
    Metalsmith(fixture('rendering-error'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin())
      .build((err) => {
        strictEqual(err instanceof Error, true)
        strictEqual(err.message.slice(0, 'index.html'.length + 1), 'index.html:')
        done()
      })
  })
})
