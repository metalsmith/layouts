# metalsmith-layouts

[![build status][build-badge]][build-url]
[![coverage status][coverage-badge]][coverage-url]
[![greenkeeper][greenkeeper-badge]][greenkeeper-url]

> A metalsmith plugin for layouts

This plugin allows you to wrap your files in a template (a `layout`) and abstract repetitive html. The plugin will pass the contents of your files as the variable `contents` and renders the result with the appropriate engine. It uses the file extension of your layout to infer which templating engine to use. So layouts with names ending in `.njk` will be processed as nunjucks, `.hbs` as handlebars, etc.

If you want to process templating syntax *in* your files, instead of wrapping them in a template, you can use [metalsmith-in-place](https://github.com/metalsmith/metalsmith-in-place). For support questions please use [stack overflow][stackoverflow-url] or our [slack channel][slack-url]. For templating engine specific questions try the aforementioned channels, as well as the documentation for [jstransformers](https://github.com/jstransformers) and your templating engine of choice.

## How does it work

Under the hood this plugin uses [jstransformers](https://github.com/jstransformers/jstransformer) to render your layouts. Since there are over a 100 jstransformers we don't install them automatically, so you'll need to install the jstransformer for the language you want to use.

For example, to render nunjucks you would install [jstransformer-nunjucks](https://github.com/jstransformers/jstransformer-nunjucks), to render handlebars you would install
[jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars), etc. The plugin will then automatically detect which jstransformers you've installed. See the [jstransformer organisation](https://github.com/jstransformers) for all available jstransformers and [this dictionary](https://github.com/jstransformers/inputformat-to-jstransformer/blob/master/dictionary.json)
to see which extensions map to which jstransformer.

## Installation

```bash
$ npm install metalsmith-layouts
```

## Options

You can pass options to `metalsmith-layouts` with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* [default](#default): optional. The default layout to apply to files.
* [directory](#directory): optional. The directory for the layouts. The default is `layouts`.
* [pattern](#pattern): optional. Only files that match this pattern will be processed. Accepts a string or an array of strings. The default is `**`.
* [engineOptions](#engineoptions): optional. Use this to pass options to the jstransformer that's rendering your layouts. The default is `{}`.
* [suppressNoFilesError](#suppressnofileserror): optional. An error won’t be thrown if no files are present for processing.

### `default`

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

### `directory`

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

### `pattern`

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

### `engineOptions`

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

### `suppressNoFilesError`

`metalsmith-layouts` throws [an error](#no-files-to-process) in metalsmith if it can’t find any files to process. If you’re doing any kind of incremental builds via something like `metalsmith-watch`, this is problematic as you’re likely only rebuilding files that have changed. This flag allows you to suppress that error.

Note that if you have [debugging](#errors-and-debugging) turned on, you’ll see a message denoting when no files are present for processing.

## Example

### 1. Install dependencies:

```bash
$ npm install --save metalsmith metalsmith-layouts
```

In this case we'll use handlebars, so we'll install jstransformer-handlebars:

```bash
$ npm install --save jstransformer-handlebars
```

### 2. Configure metalsmith

We'll create a `metalsmith.json` configuration file in the root of the project, a file in `./src` that we want to render in a
layout and a handlebars layout for metalsmith-layouts to process in `./layouts`:

`./metalsmith.json`

```json
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

```bash
$ node_modules/.bin/metalsmith
```

Which will output the following file:

`./build/index.html`

```html
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

## FAQ

> I want to use handlebars partials and or helpers.

Use [metalsmith-discover-partials](https://www.npmjs.com/package/metalsmith-discover-partials) and [metalsmith-discover-helpers](https://www.npmjs.com/package/metalsmith-discover-helpers).

> I want to change the extension of my templates.

Use [metalsmith-rename](https://www.npmjs.com/package/metalsmith-rename).

> My templating language requires a filename property to be set.

Use [metalsmith-filenames](https://www.npmjs.com/package/metalsmith-filenames).

## Errors and debugging

If you're encountering problems you can use [debug](https://www.npmjs.com/package/debug) to enable verbose logging. To enable `debug` prefix your build command with `DEBUG=metalsmith-layouts`. So if you normally run `metalsmith` to build, use `DEBUG=metalsmith-layouts metalsmith` (on windows the syntax is [slightly different](https://www.npmjs.com/package/debug#windows-note)).

### No files to process

There are several things that might cause you to get a `no files to process` error:

* Your [pattern](#pattern) does not match any files
* None of your files pass validation, validation fails for files that:
  * Have no layout
  * Have a layout without an extension
  * Are not utf-8
  * Have a layout that needs a jstransformer that hasn't been installed

## Credits

* [Ian Storm Taylor](https://github.com/ianstormtaylor) for creating [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), on which this plugin was based
* [Rob Loach](https://github.com/RobLoach) for creating [metalsmith-jstransformer](https://github.com/RobLoach/metalsmith-jstransformer), which inspired our switch to jstransformers

## License

[MIT](https://ismay.mit-license.org/)

[build-badge]: https://travis-ci.org/metalsmith/metalsmith-layouts.svg?branch=master
[build-url]: https://travis-ci.org/metalsmith/metalsmith-layouts
[greenkeeper-badge]: https://badges.greenkeeper.io/metalsmith/metalsmith-layouts.svg
[greenkeeper-url]: https://greenkeeper.io
[coverage-badge]: https://coveralls.io/repos/github/metalsmith/metalsmith-layouts/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/metalsmith/metalsmith-layouts?branch=master
[slack-url]: http://metalsmith-slack.herokuapp.com/
[stackoverflow-url]: http://stackoverflow.com/questions/tagged/metalsmith
