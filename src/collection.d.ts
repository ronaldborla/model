import Model from './model';
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
    /**
     * Length
     * Arrays have a "length" writable property
     */
    length: number;
    constructor(items?: Array<any>);
    /**
     * Placeholder methods
     */
    cast(item: any): any;
    concat(...items: any[]): any[];
    copyWithin(target: number, start?: number, end?: number): this;
    every(callbackfn: (value: Model, index: number, array: Model[]) => boolean, thisArg?: any): boolean;
    fill(value: any, start?: number, end?: number): this;
    filter(callbackfn: (value: Model, index: number, array: Model[]) => any, thisArg?: any): Model[];
    find(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): any;
    findIndex(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): number;
    forEach(callbackfn: (value: Model, index: number, array: Model[]) => void, thisArg?: any): void;
    indexOf(searchElement: any, fromIndex?: number): number;
    join(separator?: string): string;
    lastIndexOf(searchElement: any, fromIndex?: number): number;
    load(items: Array<any>): Collection;
    map<U>(callbackfn: (value: Model, index: number, array: Model[]) => U, thisArg?: any): U[];
    pop(): Model | undefined;
    push(...items: any[]): number;
    reduce(callbackfn: (previousValue: Model, currentValue: Model, currentIndex: number, array: Model[]) => Model, initialValue?: Model): Model;
    reduceRight(callbackfn: (previousValue: Model, currentValue: Model, currentIndex: number, array: Model[]) => Model, initialValue?: Model): Model;
    reverse(): Model[];
    shift(): Model | undefined;
    slice(start?: number, end?: number): Model[];
    some(callbackfn: (value: Model, index: number, array: Model[]) => boolean, thisArg?: any): boolean;
    splice(start: number, deleteCount?: number, ...items: any[]): Model[];
    sort(compareFn?: (a: Model, b: Model) => number): this;
    toObject(include?: any, exclude?: any): any;
    toJSON(exclude?: any, include?: any, replacer?: any, space?: number): string;
    toLocaleString(): string;
    toString(): string;
    unshift(...items: any[]): number;
}
