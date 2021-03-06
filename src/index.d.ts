import Collection from './collection';
import Exception from './exception';
import Key from './key';
import Model from './model';
import Schema from './schema';
import Type from './type';
import { Utils } from './utils';
import utils from './utils';
export { Collection, Exception, Key, Model, Schema, Type, Utils, utils };
/**
 * Model JS
 */
export declare class ModelJS {
    /**
     * Exception to use
     */
    Exception: any;
    /**
     * Key to use
     */
    Key: any;
    /**
     * Schema to use
     */
    Schema: any;
    /**
     * Type to use
     */
    Type: any;
    /**
     * All types
     */
    types: {};
    /**
     * All schemas
     */
    schemas: Array<Schema>;
    /**
     * Boot Model JS
     */
    boot(): this;
    /**
     * Get all collections
     */
    getCollections(): Array<Collection<Model>>;
    /**
     * Get all models
     */
    getModels(): Array<Model>;
    /**
     * Check if instance is native
     */
    isNative(instance: any): boolean;
    /**
     * Register types
     */
    register(types: any): this;
}
