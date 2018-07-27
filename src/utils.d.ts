/**
 * Utilities
 */
export declare class Utils {
    /**
     * Undefined
     */
    undefined: any;
    constructor();
    /**
     * To camel case
     */
    camelCase(str: string): string;
    /**
     * Extend object
     */
    extend(left: any, right: any, ignore?: Array<string>): any;
    /**
     * Flatten array of string
     */
    flatten(data: any): any;
    /**
     * Loop through object
     */
    forEach(object: any, callback: any): boolean;
    /**
     * Get parent constructor
     */
    getParent(constructor: any): any;
    /**
     * Check if variable is an array
     */
    isArray(variable: any): boolean;
    /**
     * Check if function
     */
    isFunction(variable: any): boolean;
    /**
     * Check if object
     */
    isObject(variable: any): boolean;
    /**
     * Check if regex
     */
    isRegExp(variable: any): boolean;
    /**
     * Check if string
     */
    isString(variable: any): boolean;
    /**
     * Is undefined
     */
    isUndefined(variable: any): boolean;
}
declare const utils: Utils;
export default utils;
