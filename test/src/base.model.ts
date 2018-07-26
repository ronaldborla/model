import Model from '../../src/model';

/**
 * Base Model
 */
export default class Base extends Model {

  /**
   * Schema
   */
  protected static schema: any = {
    id: 'Id',
    created: {
      default: Date.now,
      type: Date
    },
    updated: {
      default: Date.now,
      type: Date
    }
  };

  /**
   * Get ID as string
   */
  getIdAttribute(object: any): string {
    return (object || {}).value + '';
  }

  /**
   * Get sex as string
   */
  getSexAttribute(object: any): string {
    return (object || {}).value + '';
  }

}
