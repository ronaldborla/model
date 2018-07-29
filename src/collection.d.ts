/**
 * Collection
 */
export default class Collection<Model> implements Array<Model> {
    [key: number]: Model;
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
    constructor(items?: Array<any>);
    readonly length: number;
    /**
     * Placeholder methods
     */
    cast(item: any): any;
    concat(...items: any[]): any[];
    every(callbackfn: (value: any, index: number, array: any[]) => boolean, thisArg?: any): boolean;
    filter(callbackfn: (value: any, index: number, array: any[]) => any, thisArg?: any): any[];
    forEach(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): void;
    indexOf(searchElement: any, fromIndex?: number): number;
    join(separator?: string): string;
    lastIndexOf(searchElement: any, fromIndex?: number): number;
    load(items: Array<any>): Collection<Model>;
    map<U>(callbackfn: (value: any, index: number, array: any[]) => U, thisArg?: any): U[];
    pop(): any;
    push(...args: any[]): number;
    reduce(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue?: any): any;
    reduceRight(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue?: any): any;
    reverse(): any[];
    shift(): any;
    slice(start?: number, end?: number): any[];
    some(callbackfn: (value: any, index: number, array: any[]) => boolean, thisArg?: any): boolean;
    splice(start: number, deleteCount?: number, ...items: any[]): any[];
    sort(compareFn?: (a: any, b: any) => number): this;
    toObject(include?: any, exclude?: any): any;
    toJSON(exclude?: any, include?: any, replacer?: any, space?: number): string;
    unshift(...items: any[]): number;
}
