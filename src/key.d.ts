import Type from './type';
/**
 * Key
 */
export default class Key {
    /**
     * Default value
     */
    default: any;
    /**
     * Name
     */
    name: string;
    /**
     * Key options
     */
    options: any;
    /**
     * Schema
     */
    schema: any;
    /**
     * Type
     */
    type: Type;
    constructor(schema: any, name: string, object: any);
}
