const match = require("multimatch");
const getTransformer = require("./get-transformer");
const path = require("path");
const isUtf8 = require("is-utf8");

/**
 * Engine
 */

function render({ file, metadata, engineOptions, defaultLayout, metalsmith, directory }) {
  return new Promise(resolve => {
    const layout = file.layout || defaultLayout;
    const [, ...extensions] = layout.split(".");

    // Stringify file contents
    file.contents = file.contents.toString();

    // Go through all extensions
    const extLength = extensions.length;
    for (let i = 0; i < extLength; i += 1) {
      const ext = extensions.pop();
      const transform = getTransformer(ext);
      const locals = Object.assign({}, metadata, file);

      // Stop if the current extension can't be transformed
      if (!transform) {
        extensions.push(ext);
        break;
      }

      // If this is the last extension, replace it with a new one
      if (extensions.length === 0) {
        extensions.push(transform.outputFormat);
      }

      const layoutPath = path.join(metalsmith.path(directory), layout);
      // Transform the contents
      file.contents = transform.renderFile(
        layoutPath,
        engineOptions,
        locals
      ).body;
    }

    // Store results and delete old file
    file.contents = Buffer.from(file.contents);
    return resolve();
  });
}

/**
 * Validate
 */

function validate({ file, defaultLayout }) {
  const layout = file.layout || defaultLayout;

  // Files without a layout cannot be processed
  if (!layout) {
    return false;
  }

  // Layouts without an extension cannot be processed
  if (!layout.includes(".")) {
    return false;
  }

  // Files that are not utf8 are ignored
  if (!isUtf8(file.contents)) {
    return false;
  }

  // Files without an applicable jstransformer are ignored
  const extension = layout.split(".").pop();
  return getTransformer(extension);
}

/**
 * Plugin
 */

module.exports = ({
  pattern = "**",
  directory = "layouts",
  defaultLayout = false,
  engineOptions = {}
} = {}) => (files, metalsmith, done) => {
  const metadata = metalsmith.metadata();

  // Check whether the pattern option is valid
  if (!(typeof pattern === "string" || Array.isArray(pattern))) {
    done(
      new Error(
        "invalid pattern, the pattern option should be a string or array."
      )
    );
  }

  // Filter files by the pattern
  const matchedFiles = match(Object.keys(files), pattern);

  // Filter files by validity
  const validFiles = matchedFiles.filter(filename =>
    validate({ file: files[filename], defaultLayout })
  );

  // Let the user know when there are no files to process, usually caused by missing jstransformer
  if (validFiles.length === 0) {
    done(
      new Error(
        "no files to process, check whether you have a jstransformer installed."
      )
    );
  }

  // Map all files that should be processed to an array of promises and call done when finished
  Promise.all(
    validFiles.map(filename =>
      render({
        file: files[filename],
        metadata,
        engineOptions,
        defaultLayout,
        directory,
        metalsmith
      })
    )
  )
    .then(() => done())
    .catch(error => done(error));
};
