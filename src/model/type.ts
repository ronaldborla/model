/**
 * Key Type
 */
export class Type {

	/**
	 * The constructor
	 */
	public $constructor: any = null;

	/**
	 * The name
	 */
	public name: string = null;

	/**
	 * Safe name
	 */
	public safe: string = null;

	/**
	 * Type constructor
	 */
	constructor(name: string, constructor: any) {
		this.name = name + '';
		this.safe = this.name.toLowerCase();
		this.$constructor = constructor;
	}

	/**
	 * Convert a variable into this type
	 */
	public convert(variable) {
		if (!this.is(variable)) {
			variable = new this.$constructor(variable);
		}
		return variable;
	}

	/**
	 * Check if variable is an instance of this type
	 */
	public is(variable) {
		return ((typeof variable).toLowerCase() === this.safe) || (variable instanceof this.$constructor);
	}

	/**
	 * Check if constructor matches
	 */
	public match(constructor) {
		return constructor === this.$constructor;
	}
}