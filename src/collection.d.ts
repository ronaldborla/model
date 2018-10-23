/**
 * Collection
 */
export default class Collection<M> {
    [index: number]: M;
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
    /**
     * Length
     * Arrays have a "length" writable property
     */
    length: number;
    constructor(items?: Array<any>);
    /**
     * Placeholder methods
     */
    cast(item: any): M;
    concat(...items: any[]): M[];
    copyWithin(target: number, start?: number, end?: number): this;
    every(callbackfn: (value: M, index: number, array: M[]) => boolean, thisArg?: any): boolean;
    fill(value: any, start?: number, end?: number): this;
    filter(callbackfn: (value: M, index: number, array: M[]) => any, thisArg?: any): M[];
    find(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): any;
    findIndex(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): number;
    forEach(callbackfn: (value: M, index: number, array: M[]) => void, thisArg?: any): void;
    indexOf(searchElement: any, fromIndex?: number): number;
    join(separator?: string): string;
    lastIndexOf(searchElement: any, fromIndex?: number): number;
    load(items: Array<any>): Collection<M>;
    map<U>(callbackfn: (value: M, index: number, array: M[]) => U, thisArg?: any): U[];
    pop(): M | undefined;
    push(...items: any[]): number;
    reduce(callbackfn: (previousValue: M, currentValue: M, currentIndex: number, array: M[]) => M, initialValue?: M): M;
    reduceRight(callbackfn: (previousValue: M, currentValue: M, currentIndex: number, array: M[]) => M, initialValue?: M): M;
    reverse(): M[];
    shift(): M | undefined;
    slice(start?: number, end?: number): M[];
    some(callbackfn: (value: M, index: number, array: M[]) => boolean, thisArg?: any): boolean;
    splice(start: number, deleteCount?: number, ...items: any[]): M[];
    sort(compareFn?: (a: M, b: M) => number): this;
    toObject(include?: any, exclude?: any): any;
    toJSON(exclude?: any, include?: any, replacer?: any, space?: number): string;
    toLocaleString(): string;
    toString(): string;
    unshift(...items: any[]): number;
}
