# metalsmith-layouts

A fork of [metalsmith-templates](https://github.com/segmentio/metalsmith-templates). The original `metalsmith-templates` uses the `inPlace` flag to switch between either in-place templating or embedding a file within a template, this fork just embeds source files in templates. It can be used in conjunction with [ismay/metalsmith-templates](https://github.com/ismay/metalsmith-templates), which just supports in-place templating.

This originated in [https://github.com/segmentio/metalsmith-templates/issues/35](https://github.com/segmentio/metalsmith-templates/issues/35). Splitting up `metalsmith-templates` was suggested by Ian Storm Taylor as a way to simplify both use-cases. It allows you to apply templates (or layouts) to your files *and/or* render the templating syntax in your source files.

## Installation

```bash
$ npm install git://github.com/ismay/metalsmith-layouts.git
```

## Usage

All `metalsmith-layouts` does is apply layouts to your source files. Pass options to `metalsmith-layouts` with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* `engine`: templating engine
* `default`: default template (optional)
* `directory`: directory for the layouts, `layouts` by default (optional)
* `pattern`: only files that match this pattern will be processed (optional)

## Example

Configuration in `metalsmith.json`:

```
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

## Differences with segmentio/metalsmith-templates

* The `inPlace` option has been removed
* Use `layout` instead of `template` in the front-matter to specify a layout
* The default folder for layouts is `layouts` instead of `templates`

For further documentation see the original [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), but keep these differences in mind.

## License

MIT
