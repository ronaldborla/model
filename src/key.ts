import Collection from './collection';
import Model from './model';
import Type from './type';
import utils from './utils';

/**
 * Key
 */
export default class Key {

  /**
   * Default value
   */
  public default: any;

  /**
   * Name
   */
  public name: string;

  /**
   * Key options
   */
  public options: any;

  /**
   * Schema
   */
  public schema: any;

  /**
   * Type
   */
  public type: Type;

  constructor(schema: any, name: string, object: any) {
    const key = this;
    this.default = object.default;
    this.name = name;
    this.options = object.options;
    this.schema = schema;
    let type = object.type || object;
    if (utils.isString(type)) {
      type = this.schema.modeljs.types[type];
    }
    if (utils.isUndefined(type)) {
      throw new this.schema.modeljs.Exception('Type for key `' + name + '` is not registered');
    }
    this.type = new this.schema.modeljs.Type(this, type);
    Object.defineProperty(this.schema.Model.prototype, this.name, {
      enumerable: true,
      get: function getAttribute() {
        return callMutator.apply(this, ['get', this.__.attributes[key.name]]);
      },
      set: function setAttribute(value: any) {
        const previous = this.__.attributes[key.name],
              options = key.options || utils.undefined;
        if (!utils.isUndefined(options)) {
          options.parent = this;
        }
        value = setParent(key.type.cast(value, options), this);
        this.__.attributes[key.name] = value = callMutator.apply(this, ['set', value, previous]);
      }
    });

    /**
     * Call mutator
     */
    function callMutator(method: string, value: any, previous?: any): any {
      let mutator = key.schema.cache.mutators[method][key.name];
      if (utils.isUndefined(mutator)) {
        let fn = utils.camelCase([method, name, 'attribute'].join(' '));
        mutator =
          key.schema.cache.mutators[method][name] =
          utils.isFunction(this[fn]) ? fn : null;
      }
      if (mutator !== null) {
        value = this[mutator].apply(this, [value, previous]);
      }
      return value;
    }

    /**
     * Set Model or Collection parent
     */
    function setParent(value: any, parent: any): any {
      if (value && ((value instanceof Model) || (value instanceof Collection))) {
        value.__.parent = parent;
      }
      return value;
    }
  }
}
