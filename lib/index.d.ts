import { Plugin } from "metalsmith";

export default layouts;
export type Render = (source: string, options: any, locals: any) => string;
export type RenderAsync = (source: string, options: any, locals: any, callback: Function) => Promise<string>;
export type Compile = (source: string, options: any) => string;
export type CompileAsync = (source: string, options: any, callback: Function) => Promise<string>;
export type JsTransformer = {
  name: string;
  inputFormats: string[];
  outputFormat: string;
  render?: Render;
  renderAsync?: RenderAsync;
  compile?: Compile;
  compileAsync?: CompileAsync;
  [key]?: string;
};

/**
 * `@metalsmith/layouts` options
 */
export type Options = {
    /**
     * Jstransformer to run: name of a node module or local JS module path (starting with `.`) whose default export is a jstransformer. As a shorthand for existing transformers you can remove the `jstransformer-` prefix: `handlebars` will be understood as `jstransformer-handlebars`. Or an actual jstransformer; an object with `name`, `inputFormats`,`outputFormat`, and at least one of the render methods `render`, `renderAsync`, `compile` or `compileAsync` described in the [jstransformer API docs](https://github.com/jstransformers/jstransformer#api)
     */
    transform: string|JsTransformer
    /**
     * A default layout to apply to files, eg `default.njk`.
     * @default null
     */
    default?: string;
    /**
     * Only files that match this pattern will be processed. Accepts a string or an array of strings.
     * @default '**'
     */
    pattern?: string|string[];
    /**
     * The directory for layouts, relative to `metalsmith.directory()`.
     * @default 'layouts'
     */
    directory?: string;
    /**
     * Pass options to [the jstransformer](https://github.com/jstransformers/jstransformer) that's rendering your layouts. The default is `{}`.
     */
    engineOptions?: any;
    /**
     * Pass `''` to remove the extension or `'.<extname>'` to keep or rename it. By default the extension is kept
     */
    extname?: string;
};

/**
 * A metalsmith plugin for rendering layouts
 * @example
 * import nunjucks from 'jstransformer-nunjucks'
 *
 * metalsmith
 *  .use(layouts({ transform: 'jstransformer-nunjucks' })) // use jstransformer-nunjucks
 *  .use(layouts({ transform: 'nunjucks' }))               // shorthand for above
 *  .use(layouts({ transform: nunjucks }))                 // equivalent to above
 *  .use(layouts({ transform: './local/transform.js' }))   // custom local transformer
 *  .use(layouts({ transform: {                            // custom inline transformer
 *     name: 'prepend-hello',
 *     inputFormats: ['prepend-hello'],
 *     outputFormat: 'html',
 *     render(str, options, locals) => {
 *       return 'hello ' + str
 *     }
 *   }}))
 */
declare function layouts(options: Options): Plugin;