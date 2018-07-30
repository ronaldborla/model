import Model from './model';
import utils from './utils';

/**
 * Collection
 */
export default class Collection {

  /**
   * The Model
   */
  public static Model: any;

  /**
   * Is Collection
   */
  public static isCollection = true;

  /**
   * Private storage
   */
  public __: any = {
    parent: null
  };

  constructor(items?: Array<any>) {
    if (!utils.isUndefined(items)) {
      this.load(items);
    }
  }

  /**
   * Placeholder methods
   */
  get length(): number {
    return 0;
  }
  cast(item: any): any {
    return item;
  }
  concat(...items: any[]): any[] {
    return [];
  }
  copyWithin(target: number, start?: number, end?: number): this {
    return this;
  }
  every(callbackfn: (value: Model, index: number, array: Model[]) => boolean, thisArg?: any): boolean {
    return false;
  }
  fill(value: any, start?: number, end?: number): this {
    return this;
  }
  filter(callbackfn: (value: Model, index: number, array: Model[]) => any, thisArg?: any): Model[] {
    return [];
  }
  find(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): any {
    return this;
  }
  findIndex(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): number {
    return 0;
  }
  forEach(callbackfn: (value: Model, index: number, array: Model[]) => void, thisArg?: any): void {
  }
  indexOf(searchElement: any, fromIndex?: number): number {
    return 0;
  }
  join(separator?: string): string {
    return '';
  }
  lastIndexOf(searchElement: any, fromIndex?: number): number {
    return 0;
  }
  load(items: Array<any>): Collection {
    return this;
  }
  map<U>(callbackfn: (value: Model, index: number, array: Model[]) => U, thisArg?: any): U[] {
    return [];
  }
  pop(): Model | undefined {
    return undefined;
  }
  push(...items: any[]): number {
    return 0;
  }
  reduce(callbackfn: (previousValue: Model, currentValue: Model, currentIndex: number, array: Model[]) => Model, initialValue?: Model): Model {
    return this[0];
  }
  reduceRight(callbackfn: (previousValue: Model, currentValue: Model, currentIndex: number, array: Model[]) => Model, initialValue?: Model): Model {
    return this[0];
  }
  reverse(): Model[] {
    return [];
  }
  shift(): Model | undefined {
    return undefined;
  }
  slice(start?: number, end?: number): Model[] {
    return [];
  }
  some(callbackfn: (value: Model, index: number, array: Model[]) => boolean, thisArg?: any): boolean {
    return false;
  }
  splice(start: number, deleteCount?: number, ...items: any[]): Model[] {
    return [];
  }
  sort(compareFn?: (a: Model, b: Model) => number) : this {
    return this;
  }
  toObject(include?: any, exclude?: any): any {
    return {};
  }
  toJSON(exclude?: any, include?: any, replacer?: any, space?: number): string {
    return '';
  }
  toLocaleString(): string {
    return '';
  }
  toString(): string {
    return '';
  }
  unshift(...items: any[]): number {
    return 0;
  }
}

/**
 * For some reason, "extends" in typescript doesn't correctly extend an Array
 * Therefore, this needs to be done in a different manner
 * The "extends Array" statement above is for Typescript consistency
 */

/**
 * Extend Array
 */
Collection.prototype = Object.create(Array.prototype);
Collection.prototype.constructor = Collection;

/**
 * Collection functions must be declared outside the Class definition
 */
(Collection.prototype as any).cast = cast;
(Collection.prototype as any).concat = concat;
(Collection.prototype as any).load = load;
(Collection.prototype as any).push = push;
(Collection.prototype as any).splice = splice;
(Collection.prototype as any).toJSON = toJSON;
(Collection.prototype as any).toObject = toObject;
(Collection.prototype as any).toString = toString;
(Collection.prototype as any).unshift = unshift;

////////

/**
 * Cast an item
 */
function cast(item: any): any {
  const Model = (this.constructor as typeof Collection).Model;
  if (!(item instanceof Model)) {
    item = new Model(item);
  }
  item.__.parent = this;
  return item;
}

/**
 * Override concat
 */
function concat(): Collection {
  const length = arguments.length;
  for (let i = 0; i < length; i++) {
    this.push.apply(this, arguments[i]);
  }
  return this;
}

/**
 * Load items
 */
function load(items: Array<any>): Collection {
  this.push.apply(this, items || []);
  return this;
}

/**
 * Override push
 */
function push(): number {
  return Array.prototype.push.apply(this, Array.prototype.map.apply(arguments, [(item: any) => {
    return this.cast(item);
  }]));
}

/**
 * Override splice
 */
function splice(): Collection {
  const length = arguments.length;
  if (length > 2) {
    for (let i = 2; i < length; i++) {
      arguments[i] = this.cast(arguments[i]);
    }
  }
  return Array.prototype.splice.apply(this, arguments);
}

/**
 * To JSON
 */
function toJSON(exclude?: any, include?: any, replacer?: any, space?: number): string {
  return JSON.stringify(this.toObject(exclude, include), replacer, space);
}

/**
 * Convert to object
 */
function toObject(include?: any, exclude?: any): any {
  if (include && !include.__flattened) {
    include = utils.flatten(include);
  }
  if (exclude && !exclude.__flattened) {
    exclude = utils.flatten(exclude);
  }
  return this.map((item: any) => {
    return item.toObject(include, exclude);
  });
}

/**
 * To string
 */
function toString(): string {
  return this.toJSON();
}

/**
 * Override unshift
 */
function unshift(): number {
  const length = arguments.length;
  for (let i = 0; i < length; i++) {
    arguments[i] = this.cast(arguments[i]);
  }
  return Array.prototype.unshift.apply(this, arguments);
}
