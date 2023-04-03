import { Plugin } from "metalsmith";
import getTransformer from "./get-transformer";

export default layouts;
/**
 * `@metalsmith/layouts` options
 */
export type Options = {
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
