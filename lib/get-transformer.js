const jstransformer = require('jstransformer')
const toTransformer = require('inputformat-to-jstransformer')

const cache = {}

module.exports = function getTransformer(ext) {
  if (ext in cache) {
    return cache[ext]
  }

  const transformer = toTransformer(ext)
  cache[ext] = transformer ? jstransformer(transformer) : false

  return cache[ext]
}
