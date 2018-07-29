import Base from './base.model';

/**
 * Profile Model
 */
export default class Profile extends Base {

  /**
   * Schema
   */
  public static schema: any = {
    birth_date: Date,
    first_name: String,
    last_name: String,
    middle_name: String,
    sex: {
      default: 'male',
      options: [
        'male',
        'female'
      ],
      type: 'Enum'
    }
  };

  public static Collection = 'Profiles';

  /**
   * Get full name
   */
  get full_name() {
    return [(this as any).first_name, (this as any).last_name].join(' ');
  }

}
