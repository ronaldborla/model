import utils from './utils';
/**
 * Type
 */
export default class Type {

  /**
   * Type Constructor
   */
  public Constructor: any;

  /**
   * Constructor has compare method
   */
  public hasCompare: boolean;

  /**
   * The key
   */
  public key: any;

  /**
   * Type name
   */
  public name: string;

  /**
   * Safe name
   */
  public safe: string;

  constructor(key: any, Constructor: any) {
    this.key = key;
    if (!utils.isFunction(Constructor)) {
      throw new this.key.schema.modeljs.Error('Type must be a constructor');
    }
    this.Constructor = Constructor;
    this.hasCompare = utils.isFunction(this.Constructor.prototype.compare);
    this.name = this.Constructor.name;
    this.safe = this.name.toLowerCase();
  }

  /**
   * Cast
   */
  cast(value: any, options?: any): any {
    if (value === null) {
      return value;
    }
    if (!this.is(value)) {
      value = utils.isUndefined(options) ?
        new this.Constructor(value) :
        new this.Constructor(value, options);
    }
    return value;
  }

  /**
   * Compare
   * Compare two values
   * @return -1 if a is less than b, 1 if a is greater than b, 0 if equal
   */
  compare(a: any, b: any): number {
    if (this.hasCompare === true) {
      return a.compare(b);
    }
    if (a > b) {
      return 1;
    }
    if (b > a) {
      return -1;
    }
    return 0;
  }

  /**
   * Check if value is instance of this type
   */
  is(value: any): boolean {
    return value && (
      (value instanceof this.Constructor) ||
      (value.constructor.name === this.Constructor.name) ||
      ((typeof value).toLowerCase() === this.safe)
    );
  }
}
