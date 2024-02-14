import { Plugin } from "metalsmith";
import getTransformer from "./get-transformer";

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
    transform?: string|JsTransformer
    /**
     * A default layout to apply to files, eg `default.njk`.
     */
    default?: string;
    /**
     * The directory for the layouts. The default is `layouts`.
     */
    pattern?: string;
    /**
     * Only files that match this pattern will be processed. Accepts a string or an array of strings. The default is `**` (all).
     */
    directory?: string | string[];
    /**
     * Pass options to [the jstransformer](https://github.com/jstransformers/jstransformer) that's rendering your layouts. The default is `{}`.
     */
    engineOptions?: any;
    /**
     * By default `@metalsmith/layouts` will exit with an error if there aren't any files to process. Enabling this option will suppress that error.
     */
    suppressNoFilesError?: boolean;
};
/**
 * A metalsmith plugin for rendering layouts
 * @param {Options} options
 * @returns {import('metalsmith').Plugin}
 */
declare function layouts(options: Options): Plugin;
declare namespace layouts {
    export { getTransformer };
}
