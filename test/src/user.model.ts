import Base from './base.model';

/**
 * User Model
 */
export default class User extends Base {

  /**
   * Schema
   */
  public static schema: any = {
    email: String,
    profile: 'Profile',
    username: String
  };

  public static Collection = 'Users';

}
