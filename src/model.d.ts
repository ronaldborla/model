/**
 * Model
 */
export default class Model {
    /**
     * Loose property definition
     * This allows for valid access to dynamic
     * properties defined in the schema
     */
    [key: string]: any;
    /**
     * The Collection
     */
    static Collection: any;
    /**
     * The schema
     */
    static schema: any;
    /**
     * Is Model
     */
    static isModel: boolean;
    /**
     * Private storage
     */
    __: any;
    constructor(data?: any);
    /**
     * Load data
     */
    load(data?: any): Model;
    /**
     * To JSON
     */
    toJSON(exclude?: any, include?: any, replacer?: any, space?: number): string;
    /**
     * Convert model to object
     */
    toObject(include?: any, exclude?: any): any;
    /**
     * To string
     */
    toString(): string;
}
