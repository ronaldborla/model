import Model from '../../src/model';

/**
 * Base Model
 */
export default class Base extends Model {

  /**
   * Schema
   */
  public static schema: any = {
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

}
