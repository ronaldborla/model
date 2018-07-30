import Key from './key';
/**
 * Schema
 */
export default class Schema {
    /**
     * Schema keys
     */
    keys: Array<Key>;
    /**
     * The model
     */
    Model: any;
    /**
     * The Model JS object
     */
    modeljs: any;
    /**
     * Cache
     */
    cache: any;
    constructor(modeljs: any, model: any);
}
