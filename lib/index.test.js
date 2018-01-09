/* eslint-env jest */

const Metalsmith = require('metalsmith')
const equal = require('assert-dir-equal')
const rimraf = require('rimraf')
const path = require('path')
const plugin = require('./index')

describe('metalsmith-layouts', () => {
  it('should apply a single layout to a single file', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'single-file')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should apply a single layout to multiple files', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'multiple-files')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should apply multiple layouts to multiple files', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'multiple-files-and-layouts')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should apply a default layout', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'default-layout')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin({ defaultLayout: 'standard.hbs' })).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should override a default layout', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'override-default-layout')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin({ defaultLayout: 'standard.hbs' })).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should apply the pattern', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'pattern')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin({ pattern: 'match.html' })).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should ignore binary files', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'ignore-binary')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin({ defaultLayout: 'standard.hbs' })).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })
})
