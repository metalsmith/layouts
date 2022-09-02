# @metalsmith/layouts

A metalsmith plugin for layouts

[![metalsmith: core plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![ci: build][ci-badge]][ci-url]
[![code coverage][codecov-badge]][codecov-url]
[![license: MIT][license-badge]][license-url]

This plugin allows you to wrap your files in a template (a `layout`) and abstract repetitive html. The plugin will pass the contents of your files to the layout as the variable `contents`, and renders the result with the appropriate templating engine. It uses the file extension of your layout to infer which templating engine to use. So layouts with names ending in `.njk` will be processed as nunjucks, `.hbs` as handlebars, etc.

If you want to process templating syntax _in_ your files, instead of wrapping them in a template, you can use [@metalsmith/in-place](https://github.com/metalsmith/in-place). For usage examples check out our [wiki](https://github.com/metalsmith/layouts/wiki). Feel free to contribute an example if anything is missing, or update the existing ones. For support questions please use [stack overflow][stackoverflow-url] or our [slack channel][slack-url]. For templating engine specific questions try the aforementioned channels, as well as the documentation for [jstransformers](https://github.com/jstransformers) and your templating engine of choice.

## How does it work

Under the hood this plugin uses [jstransformers](https://github.com/jstransformers/jstransformer) to render your layouts. Since there are over a 100 jstransformers we don't install them automatically, so you'll need to install the jstransformer for the language you want to use.

For example, to render nunjucks you would install [jstransformer-nunjucks](https://github.com/jstransformers/jstransformer-nunjucks), to render handlebars you would install
[jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars), etc. The plugin will then automatically detect which jstransformers you've installed. See the [jstransformer organisation](https://github.com/jstransformers) for all available jstransformers and [this dictionary](https://github.com/jstransformers/inputformat-to-jstransformer/blob/master/dictionary.json)
to see which extensions map to which jstransformer.

## Installation

NPM:

```bash
npm install @metalsmith/layouts
```

Yarn:

```bash
yarn add @metalsmith/layouts
```

## Usage

### Options

You can pass options to `@metalsmith/layouts` with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

- [default](#default): optional. The default layout to apply to files.
- [directory](#directory): optional. The directory for the layouts. The default is `layouts`.
- [pattern](#pattern): optional. Only files that match this pattern will be processed. Accepts a string or an array of strings. The default is `**`.
- [engineOptions](#engineoptions): optional. Use this to pass options to the jstransformer that's rendering your layouts. The default is `{}`.
- [suppressNoFilesError](#suppressnofileserror): optional. By default `@metalsmith/layouts` will exit with an error if there aren't any files to process. Enabling this option will suppress that error.

#### `default`

The default layout to use. Can be overridden with the `layout` key in each file's YAML frontmatter, by passing either a layout or `false`. Passing `false` will skip the file entirely.

If a `default` layout has been specified, `@metalsmith/layouts` will apply layouts to all files, so you might want to ignore certain files with a pattern. Don't forget to specify the default template's file extension. The snippet below will apply the `default.hbs` layout to all files, unless overridden in the frontmatter:

```js
import layouts from '@metalsmith/layouts'

metalsmith.use(
  layouts({
    default: 'default.hbs'
  })
)
```

#### `directory`

You can change the directory where `@metalsmith/layouts` looks for layouts (default=`layouts`) by supplying the `directory` option. In the example below we use `templates` instead:

```js
import layouts from '@metalsmith/layouts'

metalsmith.use(
  layouts({
    directory: 'templates'
  })
)
```

The directory path is resolved **relative to** `Metalsmith#directory`, not `Metalsmith#source`.
If you prefer having the layouts directory _inside_ the Metalsmith source folder, it is advisable to use `Metalsmith#ignore`:

```js
import layouts from '@metalsmith/layouts'

metalsmith.ignore('layouts').use(
  layouts({
    directory: 'src/layouts'
  })
)
```

#### `pattern`

For example:

```js
import layouts from '@metalsmith/layouts'

metalsmith(__dirname).use(
  layouts({
    engineOptions: {
      pattern: '**/*.html'
    }
  })
)
```

...would process all files that have the `.html` extension. Beware that the extensions might be changed by other plugins in the build chain, preventing the pattern from matching. We use [multimatch](https://github.com/sindresorhus/multimatch) for the pattern matching.

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

#### `suppressNoFilesError`

`@metalsmith/layouts` exits with [an error](#no-files-to-process) if it can’t find any files to process. If you’re doing any kind of incremental builds via something like `metalsmith-watch`, this is problematic as you’re likely only rebuilding files that have changed. This flag allows you to suppress that error.

Note that when this option is turned on, if you're logging [debug](#debug) messages, you’ll still see a message denoting when there aren't any files for `@metalsmith/layouts` to process.

There are several things that might cause you to get a `no files to process` error:

- Your [pattern](#pattern) does not match any files
- None of your files pass validation, validation fails for files that:
  - Have no layout
  - Have a layout without an extension
  - Are not utf-8
  - Have a layout that needs a jstransformer that hasn't been installed

### Debug

To enable debug logs, set the `DEBUG` environment variable to `@metalsmith/layouts`:

Linux/Mac:

```bash
DEBUG=@metalsmith/layouts
```

Windows:

```batch
set "DEBUG=@metalsmith/layouts"
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
        "suppressNoFilesError": false,
        "engineOptions": {}
      }
    }
  ]
}
```

## FAQ

> I want to use handlebars partials and or helpers.

Use [metalsmith-discover-partials](https://www.npmjs.com/package/metalsmith-discover-partials) and [metalsmith-discover-helpers](https://www.npmjs.com/package/metalsmith-discover-helpers).

> I want to change the extension of my templates.

Use [metalsmith-rename](https://www.npmjs.com/package/metalsmith-rename).

> My templating language requires a filename property to be set.

Use [metalsmith-filenames](https://www.npmjs.com/package/metalsmith-filenames).

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
