/**
 * Type Id
 * This is used for primary keys
 */
export default class Id {

  /**
   * ID value
   */
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  /**
   * Export
   */
  export(): string {
    return this + '';
  }

  /**
   * Convert to object
   */
  toObject(): string {
    return this.export();
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this.value + '';
  }
}
