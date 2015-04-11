
var assert = require('assert');
var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var layouts = require('..');

describe('metalsmith-layouts', function(){
  it('should render a basic layout', function(done){
    Metalsmith('test/fixtures/basic')
      .use(layouts({ engine: 'swig' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/basic/expected', 'test/fixtures/basic/build');
        done();
      });
  });

  it('should accept an engine string', function(done){
    Metalsmith('test/fixtures/basic')
      .use(layouts('swig'))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/basic/expected', 'test/fixtures/basic/build');
        done();
      });
  });

  it('should accept a pattern to match', function(done){
    Metalsmith('test/fixtures/pattern')
      .use(layouts({ engine: 'swig', pattern: '*.md' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/pattern/expected', 'test/fixtures/pattern/build');
        done();
      });
  });

  it('should accept a default layout', function(done){
    Metalsmith('test/fixtures/default')
      .use(layouts({ engine: 'swig', pattern: '*.md', default: 'default.html' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/pattern/expected', 'test/fixtures/pattern/build');
        done();
      });
  });

  it('should accept a different layouts directory', function(done){
    Metalsmith('test/fixtures/directory')
      .use(layouts({ engine: 'swig', directory: 'layouts' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/directory/expected', 'test/fixtures/directory/build');
        done();
      });
  });

  it('should mix in global metadata', function(done){
    Metalsmith('test/fixtures/metadata')
      .metadata({ title: 'Global Title' })
      .use(layouts({ engine: 'swig' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/metadata/expected', 'test/fixtures/metadata/build');
        done();
      });
  });

  it('should preserve binary files', function(done){
    Metalsmith('test/fixtures/binary')
      .use(layouts({ engine: 'swig' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/binary/expected', 'test/fixtures/binary/build');
        done();
      });
  });
});