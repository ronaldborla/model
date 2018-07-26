import utils from './utils';

/**
 * Model
 */
export default class Model {

  /**
   * The Collection
   */
  protected static Collection: any = 'Collection';

  /**
   * The schema
   */
  protected static schema: any = {};

  /**
   * Is Model
   */
  private static isModel = true;

  /**
   * Private storage
   */
  protected __: any = {
    attributes: {},
    parent: null
  };

  constructor(data?: any) {
    (this.constructor as typeof Model).schema.keys.forEach((key: any) => {
      if (data && !utils.isUndefined(data[key.name])) {
        this[key.name] = data[key.name];
      } else if (utils.isFunction(key.default)) {
        this[key.name] = key.default();
      } else if (!utils.isUndefined(key.default)) {
        this[key.name] = key.default;
      }
    });
  }

  /**
   * Load data
   */
  load(data?: any): Model {
    const schema = (this.constructor as typeof Model).schema;
    if (!utils.isUndefined(data)) {
      utils.forEach(data, (value: any, key: any) => {
        if (!utils.isUndefined(value) && !utils.isUndefined(schema.cache.index.keys[key])) {
          this[key] = value;
        }
      });
    }
    return this;
  }

  /**
   * Call parent method
   */
  super(method: string, args?: Array<any>) {
    return utils.getParent(this.constructor as typeof Model).prototype[method].apply(this, args || []);
  }

  /**
   * To JSON
   */
  toJSON(exclude?: any, include?: any, replacer?: any, space?: number): string {
    return this.toObject(exclude, include);
  }

  /**
   * Convert model to object
   */
  toObject(include?: any, exclude?: any): any {
    const object = {};
    if (include && !include.__flattened) {
      include = utils.flatten(include);
    }
    if (exclude && !exclude.__flattened) {
      exclude = utils.flatten(exclude);
    }
    (this.constructor as typeof Model).schema.keys.forEach((key: any) => {
      if (key.name !== '__' && (!exclude || exclude[key.name] !== true)) {
        evaluate(key.name, this[key.name]);
      }
    });
    if (include) {
      utils.forEach(include, (children: any, key: string) => {
        evaluate(key, this[key]);
      });
    }
    return object;

    /**
     * Evaluate
     */
    function evaluate(key: string, value: any) {
      if (value && utils.isFunction(value.toObject)) {
        value = value.toObject(
          (include && (typeof include[key] !== 'boolean')) ? include[key] : utils.undefined,
          (exclude && (typeof exclude[key] !== 'boolean')) ? exclude[key] : utils.undefined);
      }
      if (!utils.isUndefined(value)) {
        object[key] = value;
      }
    }
  }

  /**
   * To string
   */
  toString(): string {
    return this.toJSON();
  }
}
