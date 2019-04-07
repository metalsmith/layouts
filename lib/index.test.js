/* eslint-env jest */

const Metalsmith = require('metalsmith');
const equal = require('assert-dir-equal');
const rimraf = require('rimraf');
const path = require('path');
const plugin = require('./index');

describe('metalsmith-layouts', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should apply a single layout to a single file', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'single-file');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should apply a single layout to a single file with an async jstransformer', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'single-file-async');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should apply a single layout to multiple files', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'multiple-files');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should apply multiple layouts to multiple files', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'multiple-files-and-layouts');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should apply a default layout', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'default-layout');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin({ default: 'standard.hbs' })).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should override a default layout', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'override-default-layout');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin({ default: 'standard.hbs' })).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should apply a string pattern', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'string-pattern');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin({ pattern: 'match.html' })).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should apply an array of string patterns', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'array-pattern');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin({ pattern: ['match.html', 'also.html'] })).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should ignore binary files', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'ignore-binary');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin({ default: 'standard.hbs' })).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should accept an alternate directory for layouts', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'directory');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin({ directory: 'templates' })).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should process variables from the frontmatter', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'variables');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should process variables from the metadata', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'metadata');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith
      .metadata({ text: 'Some text' })
      .use(plugin())
      .build(err => {
        if (err) {
          return done(err);
        }
        expect(() => equal(actual, expected)).not.toThrow();
        return done();
      });
  });

  it('should override variables from the metadata with local ones', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'override-metadata');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith
      .metadata({ text: 'Some text' })
      .use(plugin())
      .build(err => {
        if (err) {
          return done(err);
        }
        expect(() => equal(actual, expected)).not.toThrow();
        return done();
      });
  });

  it('should return an error when there are no valid files to process', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'no-files');
    const metalsmith = new Metalsmith(base);

    return metalsmith.use(plugin()).build(err => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatchSnapshot();
      done();
    });
  });

  it('should not return an error when there are no valid files to process and suppressNoFilesError is true', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'no-files');
    const metalsmith = new Metalsmith(base);

    return metalsmith.use(plugin({ suppressNoFilesError: true })).build(err => {
      expect(err).toBe(null);
      done();
    });
  });

  it('should return an error for an invalid pattern', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'invalid-pattern');
    const metalsmith = new Metalsmith(base);

    return metalsmith
      .use(
        plugin({
          pattern: () => {}
        })
      )
      .build(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toMatchSnapshot();
        done();
      });
  });

  it('should ignore layouts without an extension', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'ignore-invalid-layout');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should ignore layouts without a jstransformer', done => {
    const base = path.join(
      process.cwd(),
      'test',
      'fixtures',
      'ignore-layout-without-jstransformer'
    );
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should allow default layouts to be disabled from the frontmatter', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'override-default');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith.use(plugin({ default: 'standard.hbs' })).build(err => {
      if (err) {
        return done(err);
      }
      expect(() => equal(actual, expected)).not.toThrow();
      return done();
    });
  });

  it('should prefix rendering errors with the filename', done => {
    jest.doMock('./get-transformer', () =>
      jest.fn(() => ({
        renderFileAsync: () => Promise.reject(new Error('Something went wrong while rendering'))
      }))
    );
    const plugin = require('./index'); // eslint-disable-line global-require, no-shadow

    const base = path.join(process.cwd(), 'test', 'fixtures', 'rendering-error');
    const metalsmith = new Metalsmith(base);

    return metalsmith.use(plugin()).build(err => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatchSnapshot();
      done();
    });
  });
});
