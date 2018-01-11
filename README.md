# metalsmith-layouts

[![npm version][version-badge]][version-url]
[![build status][build-badge]][build-url]
[![coverage status][coverage-badge]][coverage-url]
[![greenkeeper][greenkeeper-badge]][greenkeeper-url]
[![downloads][downloads-badge]][downloads-url]

> A metalsmith plugin for layouts

This plugin is a polyfill for rendering templates with templating languages that don't support inheritance. It passes your files to a template of your choice (a `layout`) as the variable `contents` and renders the result with the appropriate engine. It uses the file extension of your layout to infer which templating engine to use. So layouts with names ending in `.njk` will be processed as nunjucks, `.hbs` as handlebars, etc.

The best way to render templates is with [metalsmith-in-place](https://github.com/ismay/metalsmith-in-place) and a templating language that supports inheritance (like [nunjucks](https://mozilla.github.io/nunjucks/templating.html#template-inheritance) or [pug](https://pugjs.org/language/inheritance.html)). That way you'll have a simpler setup that's less error-prone, with support for recursive templating, chained jstransformers and more. So only use this plugin if you have a good reason for wanting to render templates with a language that doesn't support inheritance (like handlebars).

For support questions please use [stack overflow][stackoverflow-url] or our [slack channel][slack-url]. For templating engine specific questions try the aforementioned channels, as well as the documentation for [jstransformers](https://github.com/jstransformers) and your templating engine of choice.

## How does it work

Under the hood this plugin uses [jstransformers](https://github.com/jstransformers/jstransformer) to render your layouts. Since there are over a 100 jstransformers we don't install them automatically, so you'll need to install the jstransformer for the language you want to use.

For example, to render nunjucks you would install [jstransformer-nunjucks](https://github.com/jstransformers/jstransformer-nunjucks), to render handlebars you would install
[jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars), etc. The plugin will then automatically detect which jstransformers you've installed. See the [jstransformer organisation](https://github.com/jstransformers) for all available jstransformers and [this dictionary](https://github.com/jstransformers/inputformat-to-jstransformer/blob/master/dictionary.json)
to see which extensions map to which jstransformer.

## Installation

```bash
$ npm install metalsmith-layouts
```

## Example

### 1. Install dependencies:

```
$ npm install --save metalsmith metalsmith-layouts
```

In this case we'll use handlebars, so we'll install jstransformer-handlebars:

```
$ npm install --save jstransformer-handlebars
```

### 2. Configure metalsmith

We'll create a `metalsmith.json` configuration file in the root of the project, a file in `./src` that we want to render in a
layout and a handlebars layout for metalsmith-layouts to process in `./layouts`:

`./metalsmith.json`

```
{
  "source": "src",
  "destination": "build",
  "plugins": {
    "metalsmith-layouts": true
  }
}
```

`./src/index.html`

```html
---
title: The title
layout: layout.hbs
---
<p>Some text here.</p>
```

`./layouts/layout.hbs`

```handlebars
<!DOCTYPE html>
<html>
  <head>
    <title>{{ title }}</title>
  </head>
  <body>
    {{{ contents }}}
  </body>
</html>
```

### 3. Build

To build just run the metalsmith CLI:

```
$ node_modules/.bin/metalsmith
```

Which will output the following file:

`./build/index.html`

```
<!DOCTYPE html>
<html>
  <head>
    <title>The title</title>
  </head>
  <body>
    <p>Some text here.</p>
  </body>
</html>
```

## Options

You can pass options to `metalsmith-layouts` with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* [default](#default): optional. The default layout to apply to files.
* [directory](#directory): optional. The directory for the layouts. The default is `layouts`.
* [pattern](#pattern): optional. Only files that match this pattern will be processed. The default is `**`.
* [engineOptions](#engineOptions): optional. Use this to pass options to the jstransformer that's rendering your layouts. The default is `{}`.

### default

The default layout to use. Can be overridden with the `layout` key in each file's YAML frontmatter, by passing either a layout or `false`. Passing `false` will skip the file entirely.

If a `default` layout has been specified, `metalsmith-layouts` will apply layouts to all files, so you might want to ignore certain files with a pattern. Don't forget to specify the default template's file extension. So this `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-layouts": {
      "default": "default.hbs"
    }
  }
}
```

Will apply the `default.hbs` layout to all files, unless overridden in the frontmatter.

### directory

The directory where `metalsmith-layouts` looks for the layouts. By default this is `layouts`. So this `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-layouts": {
      "directory": "templates"
    }
  }
}
```

Will look for layouts in the `templates` directory, instead of in `layouts`.

### pattern

Only files that match this pattern will be processed. So this `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-layouts": {
      "pattern": "**/*.html"
    }
  }
}
```

Would process all files that have the `.html` extension. Beware that the extensions might be changed by other plugins in the build chain, preventing the pattern from matching. We use [multimatch](https://github.com/sindresorhus/multimatch) for the pattern matching.

### engineOptions

Use this to pass options to the jstransformer that's rendering your templates. So this `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-layouts": {
      "engineOptions": {
        "cache": false
      }
    }
  }
}
```

Would pass `{ "cache": false }` to the used jstransformer.

## Origins

This plugin is a fork of the now deprecated [metalsmith-templates](https://github.com/segmentio/metalsmith-templates). Splitting up `metalsmith-templates` into two plugins was suggested by Ian Storm Taylor. The results are:

* [metalsmith-in-place](https://github.com/ismay/metalsmith-in-place): render templating syntax in your source files.
* [metalsmith-layouts](https://github.com/ismay/metalsmith-layouts): apply layouts to your source files.

## License

MIT

[build-badge]: https://travis-ci.org/ismay/metalsmith-layouts.svg
[build-url]: https://travis-ci.org/ismay/metalsmith-layouts
[greenkeeper-badge]: https://badges.greenkeeper.io/ismay/metalsmith-layouts.svg
[greenkeeper-url]: https://greenkeeper.io
[coverage-badge]: https://coveralls.io/repos/github/ismay/metalsmith-layouts/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/ismay/metalsmith-layouts?branch=master
[downloads-badge]: https://img.shields.io/npm/dm/metalsmith-layouts.svg
[downloads-url]: https://www.npmjs.com/package/metalsmith-layouts
[slack-url]: http://metalsmith-slack.herokuapp.com/
[stackoverflow-url]: http://stackoverflow.com/questions/tagged/metalsmith
[version-badge]: https://img.shields.io/npm/v/metalsmith-layouts.svg
[version-url]: https://www.npmjs.com/package/metalsmith-layouts
