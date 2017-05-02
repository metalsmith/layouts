
/* global __dirname
 * Used to disable JsHint warning about __dirname being not declared. */

"use strict";

const metalsmith = require("metalsmith");

//- const layouts = require("metalsmith-layouts");
const layouts = require("../lib/index.js");

//========//========//========//========//========

//- set by node to the directory of the current file
const basedir = __dirname;

//- create a new instance and set the working directory
const msi = new metalsmith(basedir)

//- set the working directory
.directory(basedir)

//- scan this subdirectory for source files
.source("files-input")

//- write the output files to this subdirectory
.destination("files-output")

//- set file or files to not load into the pipeline
//.ignore(files)

//- set true to recreate .destination()
//.clean(bool)

//- the max number of files to read/write at a time
//.concurrency(num)

//- global metadata to pass to templates
//.metadata(object)

//- set true to enable frontmatter parsing
//.frontmatter(bool)
.frontmatter(true)

//*
//- add the .filename and .path properties to all file objects
//- add a .files property to metalsmith.metadata()
.use(function(files, metalsmith, done) {
	let files_array = [];
	
  Object.keys(files).forEach(function(current, index, array) {
    let file = files[current];
    file.filename = current;
		file.path = current;
		files_array.push(file);
  });
	
	let metadata = metalsmith.metadata();
	metadata.files = files_array;
  setImmediate(done());
})//*/

//- end the current expression
;

//========//========//========//========//========

//- start a new expression
//- allows to use the msi instance variable
msi

//* pre-process
.use(function(files, metalsmith, done) {
	console.log("pre-proecess...");
  const metadata = metalsmith.metadata();
  done();
})//*/

//*
.use(layouts({
	//- which template engine to use
	engine: "handlebars",
	
	//- where to look for templates
	directory: "layouts",
	
	//- process only file that multimatch this pattern
	pattern: "**",
	
	//- which default template to use
	"default": "layout-1.txt",
	
	//- where to look for partial files
	partials: "partials",
	
	//- don't change the file extension to .html
	rename: false,
	
	//- expose consolidate's requires cache
	exposeConsolidate: function(requires_cache) {
		console.log("requires-cache: ", requires_cache);
	},
	
	//- some other setting to pass on to the template engine
	other_setting: "other_value"
}))//*/

//* post-process
.use(function(files, metalsmith, done) {
	console.log("post-proecess...");
  const metadata = metalsmith.metadata();
  done();
})//*/

//========//========//========//========//========

//- run the build process
//- error handling is required
.build(function(error, files) {
  if(!error) { return false; }
  console.log("ERROR: " + error.message);
  throw error;
});
