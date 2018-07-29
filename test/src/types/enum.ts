/**
 * Type Enum
 */
export default class Enum {

  /**
   * ID value
   */
  private value: string;

  /**
   * Options
   */
  private options: any;

  constructor(value: string, options?: any) {
    this.value = value;
    this.options = options;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this.value + '';
  }

  /**
   * Export
   */
  export(): string {
    return this + '';
  }
}
