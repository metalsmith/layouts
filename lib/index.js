/**
 * Dependencies
 */
var consolidate = require('consolidate');
var debug = require('debug')('metalsmith-layouts');
var each = require('async').each;
var extend = require('extend');
var omit = require('lodash.omit');
var path = require('path');

/**
 * Helpers
 */
var check = require('./helpers/check');
var partialsHelper = require('./helpers/read-partials');

/**
 * Expose `plugin`.
 */
module.exports = plugin;

/**
 * Settings
 *
 * Options supported by metalsmith-layouts
 */
var settings = [
  'default',
  'directory',
  'engine',
  'partials',
  'partialExtension',
  'pattern',
  'rename',
  'exposeConsolidate'
];

/**
 * Metalsmith plugin to run files through any layout in a layout `dir`.
 *
 * @param {String or Object} options
 *   @property {String} default (optional)
 *   @property {String} directory (optional)
 *   @property {String} engine
 *   @property {String} partials (optional)
 *   @property {String} partialExtension (optional)
 *   @property {String} pattern (optional)
 *   @property {Boolean} rename (optional)
 * @return {Function}
 */
function plugin(opts){
  /**
   * Init
   */
  opts = opts || {};

  // Accept string option to specify the engine
  if (typeof opts === 'string') {
    opts = {engine: opts};
  }

  // An engine should be specified
  if (!opts.engine) {
    throw new Error('"engine" option required');
  }

  // Throw an error for unsupported engines or typos
  if (!consolidate[opts.engine]) {
    throw new Error('Unknown template engine: "' + opts.engine + '"');
  }

  if (typeof opts.exposeConsolidate === 'function') {
    opts.exposeConsolidate(consolidate.requires)
  }

  // Map options to local variables
  //- the default template file to use
  //- can be replaced by file.layout frontmatter
  var def = opts.default;
  //- a folder to search for template files
  //- must be relative to metalsmith.directory()
  var dir = opts.directory || 'layouts';
  //- the name of the engine consolidate must use
  //- engine = consolidate[opts.engine]
  var engine = opts.engine;
  //- ignore any partial file that doesn't have this extension
  //- ignore none, if this setting is missing or false
  var partialExtension = opts.partialExtension;
  //- a folder to search for partial files
  //- must be relative to metalsmith.directory()
  //- or an object ... see below
  var partials = opts.partials;
  //- ignore files if their path won't multimatch this
  var pattern = opts.pattern;
  //- set true to replace file extensions with '.html'
  var rename = opts.rename;

  // Move all unrecognised options to params
  var params = omit(opts, settings);

  /**
   * Main plugin function
   */
  return function(files, metalsmith, done){
    var metadata = metalsmith.metadata();
    var matches = {};
    var templates = {};
    
    //- an absolute path to the layouts root folder
    //- needed to compare it with a template file's folder
    let layoutsAbs = path.isAbsolute(dir) ? dir : metalsmith.path(dir);
    
    //- this will hold the original partials structure
    //  read from the disk, or supplied by the user
    //- partialsDir := { key: value }
    //- key := partial file's path (without the final extension)
    //         relative to the *partials* folder,
    //         back-slashes replaced with forward-slashes
    //- value := partial's path (without the final ext)
    //         relative to the *layouts* folder
    var partialsDir = {};
    
    //- partialsMap = { key: value }
    //- key = an absolute path to a layout file
    //- value = transformed partials containers with path
    //  values transformed to be relative to a layout file
    var partialsMap = {};

    /**
     * Process any partials and pass them to consolidate as a partials object
     */
    if (partials) {
      if (typeof partials === 'string') {
        partialsDir = partialsHelper.read(
          partials, partialExtension, dir, metalsmith);
      } else {
        partialsDir = partials;
      }
    }

    /**
     * Stringify files that pass the check, pass to matches
     */
    Object.keys(files).forEach(function(file){
      if (!check(files, file, pattern, def)) {
        return;
      }

      debug('stringifying file: %s', file);
      var data = files[file];
      data.contents = data.contents.toString();
      
      //- an absolute path of the template file to use
      var template = metalsmith.path(dir, data.layout || def);
      
      if (!templates[template]) {
        debug('found new template: %s', template);
        //- templates[templateAbsPath] = fileRelPath
        templates[template] = file;
      } else {
        //- matches[fileRelPath] = fileData
        matches[file] = data;
      }
    });

    /**
     * Render files
     */
    function convert(file, done){
      debug('converting file: %s', file);
      var data = files[file];
      
      //- an absolute path of the template file to use
      var str = metalsmith.path(dir, data.layout || def);
      //- fetch an engine's "handle"
      var render = consolidate[engine];

      // Rename file if necessary
      if (rename) {
        delete files[file];
        var fileInfo = path.parse(file);
        file = path.join(fileInfo.dir, fileInfo.name + '.html');
        debug('renamed file to: %s', file);
      }

      // Deep clone params (by passing 'true')
      //- clonedParams does not yet have a partials property
      //- only options that are unknown to this plugin
      var clonedParams = extend(true, {}, params);
      var clone = extend({}, clonedParams, metadata, data);
      
      if(partials) {
        //- partials object with paths relative to
        //  the current template file
        let partialsRel = partialsMap[str];
        
        if( !partialsRel) {//- needs to be created
          //- an absolute path to the layout file's folder
          let templateDir = path.parse(str).dir;
          
          if(templateDir === layoutsAbs) {
            //- the template file is located inside the layouts
            //  root folder; i.e. not in any subfolder
            //- so no transformation needed/necessary
            partialsRel = extend({}, partialsDir);
            partialsMap[str] = partialsRel;
          } else {//- (templateDir !== layoutAbs)
            //- the template file is located inside a subfolder
            //- consolidate expects partial path values to be
            //  relative to the template file - see issue #126
            //- so transform partial path values to solve this issue
            partialsRel = partialsHelper.transform(
              partialsDir, layoutsAbs, templateDir);
            partialsMap[str] = partialsRel;
          }
        }
        
        //- cant tell if extend() is really necessary ???
        clone.partials = extend({}, partialsRel);
      }

      //from consolidate.js
      //- exports[engine] = fromStringRenderer(!engine-name!)
      //- fromStringRenderer will return a function
      //  void function(path, options, callback)
      //  path is the path to the template file
      //- this function will first read the partial files:
      //  options.partials[key] = value
      //  partials-path = join(dirname(path) + value + extname(path))
      //  partials-content = read-as-utf8(partials-path)
      //  options.partials[key] = partials-content
      //- this function will then read the template file itself
      //- and will finally render the current file
      render(str, clone, function(err, str){
        if (err) {
          return done(err);
        }

        data.contents = new Buffer(str);
        debug('converted file: %s', file);

        files[file] = data;
        done();
      });
    }

    /**
     * Render all matched files.
     */
    function renderFiles(err) {
      if (err) {
        return done(err);
      }
      
      // Do a second pass to actually render the files
      each(Object.keys(matches), convert, done);
    }

    // Do a first pass to load templates into the consolidate cache.
    each(templates, convert, renderFiles);
  };
}
