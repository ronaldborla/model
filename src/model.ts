import utils from './utils';

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
  public static Collection: any = 'Collection';

  /**
   * The schema
   */
  public static schema: any = {};

  /**
   * Is Model
   */
  public static isModel = true;

  /**
   * Private storage
   */
  public __: any = {
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
      if (key.hidden !== true && key.name !== '__' && (!exclude || exclude[key.name] !== true)) {
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
      if (value && value.constructor && (value.constructor.isModel === true || value.constructor.isCollection === true)) {
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
