/**
 * Type
 */
export default class Type {
    /**
     * Type Constructor
     */
    Constructor: any;
    /**
     * Constructor has compare method
     */
    hasCompare: boolean;
    /**
     * The key
     */
    key: any;
    /**
     * Type name
     */
    name: string;
    /**
     * Safe name
     */
    safe: string;
    constructor(key: any, Constructor: any);
    /**
     * Cast
     */
    cast(value: any, options?: any): any;
    /**
     * Compare
     * Compare two values
     * @return -1 if a is less than b, 1 if a is greater than b, 0 if equal
     */
    compare(a: any, b: any): number;
    /**
     * Check if value is instance of this type
     */
    is(value: any): boolean;
}
