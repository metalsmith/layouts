
var assert = require('assert');
var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var templates = require('..');

describe('metalsmith-templates', function(){
  it('should render a basic template', function(done){
    Metalsmith('test/fixtures/basic')
      .use(templates({ engine: 'swig' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/basic/expected', 'test/fixtures/basic/build');
        done();
      });
  });

  it('should accept a different templates directory', function(done){
    Metalsmith('test/fixtures/basic')
      .use(templates({ engine: 'swig', directory: 'layouts' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/basic/expected', 'test/fixtures/basic/build');
        done();
      });
  });

  it('should mix in global metadata', function(done){
    Metalsmith('test/fixtures/metadata')
      .metadata({ title: 'Global Title' })
      .use(templates({ engine: 'swig' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/metadata/expected', 'test/fixtures/metadata/build');
        done();
      });
  });
});