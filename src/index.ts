import Collection from './collection';
import Exception from './exception';
import Key from './key';
import Model from './model';
import Schema from './schema';
import Type from './type';
import { Utils } from './utils';
import utils from './utils';

export { Collection, Exception, Key, Model, Schema, Type, Utils, utils };

/**
 * Model JS
 */
export class ModelJS {

  /**
   * Exception to use
   */
  public Exception: any = Exception;

  /**
   * Key to use
   */
  public Key: any = Key;

  /**
   * Schema to use
   */
  public Schema: any = Schema;

  /**
   * Type to use
   */
  public Type: any = Type;

  /**
   * All types
   */
  public types = {};

  /**
   * All schemas
   */
  public schemas: Array<Schema> = [];

  /**
   * Boot Model JS
   */
  boot(): ModelJS {
    Object.keys(this.types).forEach((key: string) => {
      if (this.types[key].isModel === true) {
        this.schemas.push(new this.Schema(this, this.types[key]));
      }
    });
    this.schemas.forEach((schema: Schema) => {
      (schema.Model as any).schema = schema;
    });
    return this;
  }

  /**
   * Get all collections
   */
  getCollections(): Array<Collection> {
    return Object.keys(this.types).filter((key: string) => {
      return this.types[key].isCollection === true;
    }).map((key) => {
      return this.types[key];
    });
  }

  /**
   * Get all models
   */
  getModels(): Array<Model> {
    return Object.keys(this.types).filter((key: string) => {
      return this.types[key].isModel === true;
    }).map((key) => {
      return this.types[key];
    });
  }

  /**
   * Register types
   */
  register(types: any): ModelJS {
    if (!utils.isArray(types)) {
      types = [types];
    }
    types.forEach((type: any) => {
      this.types[type.name] = type;
    });
    return this;
  }
}
