/**
 * Dependencies
 */
var fs = require('fs');
var path = require('path');
var read = require('fs-readdir-recursive');

/**
 * Expose `readPartials`
 */
module.exports = {
	read: readPartials,
	transform: transformPartials
};

/**
 * Helper for reading a folder with partials, returns a `partials` object that
 * can be consumed by consolidate.
 *
 * @param {String} partialsPath
 * @param {String} layoutsPath
 * @param {Object} metalsmith
 * @return {Object}
 */
function readPartials(partialsPath, partialExtension, layoutsPath, metalsmith) {
	//- determine absolute path values for the partials and layouts folders
	var partialsAbs = path.isAbsolute(partialsPath) ? partialsPath : metalsmith.path(partialsPath);
	var layoutsAbs = path.isAbsolute(layoutsPath) ? layoutsPath : metalsmith.path(layoutsPath);
	
	//- var files = read(partialAbs) will return [ '' ] (not []),
	//  if partialAbs exists, but is a file (i.e. not a folder)
	if(!fs.existsSync(partialsAbs) || !fs.statSync(partialsAbs).isDirectory()) {
			throw new Error('"partials" option must point to an existing folder');
	}
	
	//- an array of relative path values for each file found
	//- also contains all files found in subfolders, if any
	//- path values are relative to partialsAbs
  var files = read(partialsAbs);
  var partials = {};

  // Return early if there are no partials
  if (files.length === 0) {
    return partials;
  }

  // Read and process all partials
  for (var i = 0; i < files.length; i++) {
    var fileInfo = path.parse(files[i]);
		
		//- ignore the current file, if
		//-- opts.partialExtension is given and
		//-- if the partial file's extension doesn't match
    if (!partialExtension || fileInfo.ext == partialExtension) {
			//- partial's path (without the final ext) relative to the *partials* folder
			var name = path.join(fileInfo.dir, fileInfo.name);
			//- partial file's absolute path (without the final ext)
			var partialAbs = path.join(partialsAbs, name);
			//- partial's path (without the final ext) relative to the *layouts* folder
			var partialPath = path.relative(layoutsAbs, partialAbs);
			
			//- partials := { key: value }
			//- key   := partial's path (without the final ext)
			//           relative to the *partials* folder,
			//           with back-slashes replaced by forward-slashes
			//- value := partial's path (without the final ext)
			//           relative to the *layouts* folder
      partials[name.replace(/\\/g, '/')] = partialPath; 
    }
  }

  return partials;
}

/**
 * Transform the partial path values from being relative to the layouts root
 * folder to being relative to the current layout file's folder. - issue #126
 * 
 * @param {Object} partialsDir - Partials with path values relative to opts.dir.
 * These path values must be made relative to the given template's folder. This
 * is not necessary the same folder as opts.dir.
 * @param {String} layoutsAbs - An absolute path to the layouts root folder.
 * @param {String} layoutDir - An absolute path to the layout file's folder.
 * With that in mind, layoutsAbs must be a prefix of layoutDir.
 * @returns {Object} - Partials with path values relative to layoutDir.
 */
function transformPartials(partialsDir, layoutsAbs, layoutDir) {
	var partialsRel = {};
	
	Object.keys(partialsDir).forEach(function(current, index, array) {
		//- the partial file's path without the final extension,
		//  relative to the layouts root folder.
		let pathDir = partialsDir[current];
		//- the partial file's absolute path without the final extension
		let pathAbs = path.join(layoutsAbs, pathDir);
		//- the partial file's path without the final extension,
		//  relative to the template file's folder
		let pathRel = path.relative(layoutDir, pathAbs);
		partialsRel[current] = pathRel;
	});
	
	return partialsRel;
}
