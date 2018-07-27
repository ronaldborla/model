import Key from './key';
import Model from './model';
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
    Model: Model;
    /**
     * The Model JS object
     */
    modeljs: any;
    /**
     * Cache
     */
    cache: {
        index: {
            keys: {};
        };
        mutators: {
            get: {};
            set: {};
        };
    };
    constructor(modeljs: any, model: Model);
}
