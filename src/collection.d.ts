/**
 * Collection
 */
export default class Collection {
    /**
     * The Model
     */
    static Model: any;
    /**
     * Is Collection
     */
    static isCollection: boolean;
    /**
     * Private storage
     */
    __: any;
    constructor(items?: any);
    /**
     * Placeholder methods
     */
    cast(item: any): any;
    load(items: Array<any>): Collection;
    toObject(include?: any, exclude?: any): any;
    toJSON(exclude?: any, include?: any, replacer?: any, space?: number): string;
}
