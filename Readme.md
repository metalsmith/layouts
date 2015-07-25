# metalsmith-layouts

[![npm](https://img.shields.io/npm/v/metalsmith-layouts.svg)](https://www.npmjs.com/package/metalsmith-layouts) [![Build Status](https://travis-ci.org/superwolff/metalsmith-layouts.svg)](https://travis-ci.org/superwolff/metalsmith-layouts) [![Dependency Status](https://david-dm.org/superwolff/metalsmith-layouts.svg)](https://david-dm.org/superwolff/metalsmith-layouts) [![devDependency Status](https://david-dm.org/superwolff/metalsmith-layouts/dev-status.svg)](https://david-dm.org/superwolff/metalsmith-layouts#info=devDependencies) [![npm](https://img.shields.io/npm/dm/metalsmith-layouts.svg)](https://www.npmjs.com/package/metalsmith-layouts)

> A metalsmith plugin for layouts

This plugin passes your source files to a template as `contents` and renders them with the templating engine of your choice. You can use any templating engine supported by [consolidate.js](https://github.com/tj/consolidate.js#supported-template-engines). Pass options to `metalsmith-layouts` with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* `engine`: templating engine (required)
* `default`: default template (optional)
* `directory`: directory for the layouts, `layouts` by default (optional)
* `pattern`: only files that match this pattern will be processed (optional)

Any unrecognised options will be passed on to consolidate.js. You can use this, for example, to disable caching by passing `cache: false` to consolidate. See the [consolidate.js documentation](https://github.com/tj/consolidate.js) for all available options.

## Installation

```bash
$ npm install metalsmith-layouts
```

## Example

Configuration in `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-layouts": {
      "engine": "handlebars"
    }
  }
}
```

Source file `src/index.html`:

```html
---
layout: layout.html
title: The title
---
<p>The contents</p>
```

Layout `layouts/layout.html`:

```html
<!doctype html>
<html>
<head>
  <title>{{title}}</title>
</head>
<body>
{{{contents}}}
</body>
</html>
```

Results in `dist/index.html`:

```html
<!doctype html>
<html>
<head>
  <title>The title</title>
</head>
<body>
  <p>The contents</p>
</body>
</html>
```

## Origins

This plugin is a fork of [metalsmith-templates](https://github.com/segmentio/metalsmith-templates/issues/35). Splitting up `metalsmith-templates` into two plugins was suggested by Ian Storm Taylor. The results are:

* [metalsmith-in-place](https://github.com/superwolff/metalsmith-in-place): render templating syntax in your source files.
* [metalsmith-layouts](https://github.com/superwolff/metalsmith-layouts): apply layouts to your source files.

## License

MIT
