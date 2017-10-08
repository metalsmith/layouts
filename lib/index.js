const Jstransformer = require('metalsmith-engine-jstransformer')
const match = require('multimatch')

module.exports = ({ pattern = '**', engine: Engine = Jstransformer, engineOptions = {} } = {}) => (
  files,
  metalsmith,
  done
) => {
  // Check whether the pattern option is valid
  if (!(typeof pattern === 'string' || Array.isArray(pattern))) {
    done(new Error('invalid pattern, the pattern option should be a string or array.'))
  }

  const engine = new Engine(files, metalsmith, engineOptions)

  // Filter files by pattern first, and then by validity
  const validFiles = match(Object.keys(files), pattern).filter(filename =>
    engine.validate(filename)
  )

  // Let the user know when there are no files to process, usually caused by missing jstransformer
  if (validFiles.length === 0) {
    done(new Error('no files to process, check whether you have a jstransformer installed.'))
  }

  // Map all files that should be processed to an array of promises and call done when finished
  Promise.all(validFiles.map(filename => engine.render(filename)))
    .then(() => done())
    .catch(error => done(error))
}
