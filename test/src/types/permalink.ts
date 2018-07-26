/**
 * Type Permalink
 * This automatically generates a permalink
 */
export default class Permalink {

  /**
   * Cache
   */
  private static cache: any = {};

  /**
   * Permalink options
   */
  private options: any;

  /**
   * The value
   */
  private value: string;

  constructor(value: string, options: any) {
    this.value = value;
    this.options = options;
  }
}
