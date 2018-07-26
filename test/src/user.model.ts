import Base from './base.model';

/**
 * User Model
 */
export default class User extends Base {

  /**
   * Schema
   */
  protected static schema: any = {
    email: String,
    profile: 'Profile',
    username: String
  };

  protected static Collection = 'Users';

}
