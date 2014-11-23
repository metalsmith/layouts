# metalsmith-layouts

> A metalsmith plugin for layouts

This plugin passes your source files to a template as `contents` and renders it with the templating engine of your choice. You can use any templating engine supported by [consolidate.js](https://github.com/tj/consolidate.js). Pass options to it with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* `engine`: templating engine (required)
* `default`: default template (optional)
* `directory`: directory for the layouts, `layouts` by default (optional)
* `pattern`: only files that match this pattern will be processed (optional)

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

This plugin originated in [metalsmith-templates issue #35](https://github.com/segmentio/metalsmith-templates/issues/35). Splitting up `metalsmith-templates` into two plugins was suggested by Ian Storm Taylor. The results are:

* [metalsmith-in-place](https://github.com/superwolff/metalsmith-in-place): `metalsmith-templates` with `inPlace: true`
* [metalsmith-layouts](https://github.com/superwolff/metalsmith-layouts): `metalsmith-templates` with `inPlace: false`

Both plugins have been optimised for each use case. For `metalsmith-layouts` the differences with [metalsmith-templates](https://github.com/segmentio/metalsmith-templates) are:

* The `inPlace` option has been removed
* Use `layout` instead of `template` in the front-matter to specify a layout
* The default folder for layouts is `layouts` instead of `templates`

For further documentation see the original [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), but keep these differences in mind.

## License

MIT
