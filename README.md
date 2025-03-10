# @metalsmith/layouts

A metalsmith plugin for layouts

[![metalsmith: core plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![ci: build][ci-badge]][ci-url]
[![code coverage][codecov-badge]][codecov-url]
[![license: MIT][license-badge]][license-url]

## Features

- wraps source files' `contents` field in a layout rendered with a [Jstransformer templating engine](https://github.com/jstransformers/jstransformer)
- alters file extensions from `transform.inputFormats` to `transform.outputFormat`
- can be used multiple times with different configs per metalsmith pipeline

## Installation

NPM:

```bash
npm install @metalsmith/layouts jstransformer-handlebars
```

Yarn:

```bash
yarn add @metalsmith/layouts jstransformer-handlebars

```

This plugin works with [jstransformers](https://github.com/jstransformers/jstransformer) but they should be installed separately. `jstransformer-handlebars` is just an example, you could use any transformer. To render markdown you could install [jstransformer-marked](https://github.com/jstransformers/jstransformer-marked). To render handlebars you would install [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars). Other popular templating options include: [Nunjucks](https://github.com/jstransformers/jstransformer-nunjucks), [Twig](https://github.com/jstransformers/jstransformer-twig), [Pug](https://github.com/jstransformers/jstransformer-pug), or [EJS](https://github.com/jstransformers/jstransformer-ejs). See also [this map](https://github.com/jstransformers/inputformat-to-jstransformer/blob/master/dictionary.json) to see which extensions map to which jstransformer.

## Usage

Pass `@metalsmith/layouts` to `metalsmith.use` :

```js
import layouts from '@metalsmith/layouts'

// shorthand
metalsmith.use(layouts({ transform: 'nunjucks' }))

// same as shorthand
metalsmith.use(
  layouts({
    directory: 'layouts' // === path.join(metalsmith.directory(), 'layouts')
    transform: jsTransformerNunjucks, // resolved
    extname: '.html',
    pattern: '**/*.{njk,nunjucks}*',
    engineOptions: {}
  })
)
```

In the transformed file, you have access to `{ ...metalsmith.metadata(), ...fileMetadata }`, so that the following build

```js
metalsmith
  .metadata({ title: 'Default title', nodeVersion: process.version })
  .use(layouts({ transform: 'handlebars' }))
```

for a file:

```yml
---
title: Article title
layout: default.hbs
---
```

with layout:

```hbs
<h1>{{title}}</h1>Node v{{nodeVersion}}
```

would render `<h1>Article title</h1>Node v16.20`.

### Options

In most cases, you will only need to specify the `transform`, `default`, and `engineOptions` option.

- transform (`string|JsTransformer`): **required**. Which transformer to use. The full name of the transformer, e.g. `jstransformer-handlebars`, its shorthand `handlebars`, a relative JS module path starting with `.`, e.g. `./my-transformer.js`, whose default export is a jstransformer or an actual jstransformer: an object with `name`, `inputFormats`,`outputFormat`, and at least one of the render methods `render`, `renderAsync`, `compile` or `compileAsync` described in the [jstransformer API docs](https://github.com/jstransformers/jstransformer#api)
- [extname](#extension-handling) (`string|false|null`): optional. How to transform a file's extensions: `''|false|null` to remove the last `transform.inputFormat` matching extension, `.<ext>` to force an extension rename.
- [engineOptions](#engineoptions) (`Object<string, any>`): optional. Pass options to the jstransformer that's rendering the files. The default is `{}`.
- pattern (`string|string[]`): optional. Override default glob pattern matching `**/*.<transform.inputFormats>*`. Useful to limit the scope of the transform by path or glob to a subfolder, or to include files not matching `transform.inputFormats`.
- default (`string`): optional. The default layout to apply to files matched with `pattern`. If none is given, files matched without defined layout will be skipped. Files whose `layout` is set to `false` will also be skipped.
- directory (`string`): optional. The directory for the layouts (relative to `metalsmith.directory()`, not `metalsmith.source()`!). Defaults to `layouts`.

#### directory

The directory path is resolved **relative to** `Metalsmith#directory`, not `Metalsmith#source`.
If you prefer having the layouts directory _inside_ the Metalsmith source folder, it is advisable to use `Metalsmith#ignore` to avoid loading the layouts twice (once via Metalsmith and once via the JSTransformer):

```js
import layouts from '@metalsmith/layouts'

metalsmith.ignore('layouts').use(
  layouts({
    directory: 'src/layouts'
  })
)
```

#### `engineOptions`

Use `engineOptions` to pass options to the jstransformer that's rendering your templates. For example:

```js
import layouts from '@metalsmith/layouts'

metalsmith.use(
  layouts({
    engineOptions: {
      cache: false
    }
  })
)
```

Would pass `{ "cache": false }` to the used jstransformer.

### Extension handling

By default layouts will apply smart default extension handling based on `transform.inputFormats` and `transform.outputFormat`.
For example, any of the source files below processed through `layouts({ transform: 'handlebars' })` will yield `index.html`.

| source             | output           |
| ------------------ | ---------------- |
| src/index.hbs      | build/index.html |
| src/index.hbs.html | build/index.html |
| src/index.html.hbs | build/index.html |

### Usage with @metalsmith/in-place

In most cases `@metalsmith/layouts` is intended to be used after `@metalsmith/in-place`.
You can easily share `engineOptions` configs between both plugins:

```js
import inPlace from '@metalsmith/in-place'
import layouts from '@metalsmith/layouts'

const engineOptions = {}
metalsmith // index.hbs.hbs
  .use(inPlace({ transform: 'handlebars', extname: '', engineOptions })) // -> index.hbs
  .use(layouts({ transform: 'handlebars', engineOptions })) // -> index.html
```

@metalsmith/in-place uses a similar mechanism targeting `transform.inputFormats` file extensions by default.
The example requires files ending in `.hbs.hbs` extension, but if you don't like this, you can just have a single `.hbs` extension, and change the in-place invocation to `inPlace({ engineOptions, transform, extname: '.hbs' })` for the same result.

### Debug

To enable debug logs, set the `DEBUG` environment variable to `@metalsmith/layouts`:

```js
metalsmith.env('DEBUG', '@metalsmith/layouts*')
```

Alternatively you can set `DEBUG` to `@metalsmith/*` to debug all Metalsmith core plugins.

### CLI Usage

To use this plugin with the Metalsmith CLI, add `@metalsmith/layouts` to the `plugins` key in your `metalsmith.json` file:

```json
{
  "plugins": [
    {
      "@metalsmith/layouts": {
        "default": null,
        "directory": "layouts",
        "engineOptions": {}
      }
    }
  ]
}
```

## Credits

- [Ismay Wolff](https://github.com/ismay) for the current shape of the layouts plugin
- [Ian Storm Taylor](https://github.com/ianstormtaylor) for creating [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), on which this plugin was based
- [Rob Loach](https://github.com/RobLoach) for creating [metalsmith-jstransformer](https://github.com/RobLoach/metalsmith-jstransformer), which inspired our switch to jstransformers

## License

[MIT](LICENSE)

[npm-badge]: https://img.shields.io/npm/v/@metalsmith/layouts.svg
[npm-url]: https://www.npmjs.com/package/@metalsmith/layouts
[ci-badge]: https://app.travis-ci.com/metalsmith/layouts.svg?branch=master
[ci-url]: https://app.travis-ci.com/github/metalsmith/layouts
[metalsmith-badge]: https://img.shields.io/badge/metalsmith-core_plugin-green.svg?longCache=true
[metalsmith-url]: https://metalsmith.io
[codecov-badge]: https://img.shields.io/coveralls/github/metalsmith/layouts
[codecov-url]: https://coveralls.io/github/metalsmith/layouts
[license-badge]: https://img.shields.io/github/license/metalsmith/layouts
[license-url]: LICENSE
