
# metalsmith-templates

  A metalsmith plugin to render files with templates.

## Installation

    $ npm install metalsmith-templates

## CLI Usage

  Install the node modules and then add the `metalsmith-templates` key to your `metalsmith.json` plugins, like so:

```json
{
  "plugins": {
    "metalsmith-templates": {
      "engine": "handlebars",
      "directory": "templates"
    }
  }
}
```

## Javascript Usage

  Pass `options` to the templates plugin and pass it to Metalsmith with the `use` method:

```js
var templates = require('metalsmith-templates');

metalsmith.use(templates({
  engine: 'swig',
  directory: 'templates'
}));
```

## License

  MIT