import Key from './key';
import Model from './model';
import utils from './utils';

/**
 * Schema
 */
export default class Schema {

  /**
   * Schema keys
   */
  public keys: Array<Key> = [];

  /**
   * The model
   */
  public Model: Model;

  /**
   * The Model JS object
   */
  public modeljs: any;

  /**
   * Cache
   */
  public cache = {
    index: {
      keys: {}
    },
    mutators: {
      get: {},
      set: {}
    }
  };

  constructor(modeljs: any, model: Model) {
    const constructors = [],
          schema = {};
    this.modeljs = modeljs;
    this.Model = model;
    if (utils.isUndefined(this.modeljs.types[(this.Model as any).Collection])) {
      throw new this.modeljs.Exception('Collection `' + (this.Model as any).Collection + '` is not registered');
    }
    (this.Model as any).Collection = this.modeljs.types[(this.Model as any).Collection];
    (this.Model as any).Collection.Model = this.Model;
    while (model !== (Model as any)) {
      constructors.push(model);
      model = utils.getParent(model);
    }
    for (let i = constructors.length - 1; i >= 0; i--) {
      utils.extend(schema, constructors[i].schema);
    }
    let index = 0;
    utils.forEach(schema, (value, name) => {
      const key = new this.modeljs.Key(this, name, value);
      this.cache.index.keys[name] = index++;
      this.keys.push(key);
    });
  }
}
