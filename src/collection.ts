import utils from './utils';

/**
 * Collection
 */
export default class Collection extends Array {

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

  constructor(items?: any) {
    super();
    if (!utils.isUndefined(items)) {
      this.load(items);
    }
  }

  /**
   * Placeholder methods
   */
  cast(item: any): any {
    return item;
  }
  load(items: Array<any>): Collection {
    return this;
  }
  toObject(include?: any, exclude?: any): any {
    return {};
  }
  toJSON(exclude?: any, include?: any, replacer?: any, space?: number): string {
    return '';
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
