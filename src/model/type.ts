import { utils } from './utils';

/**
 * Key Type
 */
export class Type {

	/**
	 * The name
	 */
	public name: string = null;

	/**
	 * Safe name
	 */
	public safe: string = null;

	/**
	 * The constructor
	 */
	private __constructor: any = null;

	/**
	 * Type constructor
	 */
	constructor(name: string, constructor: any) {
		this.name = name + '';
		this.safe = this.name.toLowerCase();
		constructor.type = this;
		this.__constructor = constructor;
		this.has_compare = utils.isFunction(this.__constructor.prototype.compare);
	}

	/**
	 * Cast a variable into this type
	 */
	public cast(variable: any, options?: any) {
		if (variable === null) {
			return variable;
		}
		if (!this.is(variable)) {
			variable = utils.isUndefined(options) ?
				new this.__constructor(variable) :
				new this.__constructor(variable, options);
		}
		return variable;
	}

	/**
	 * Compare
	 */
	public compare(a: any, b: any) {
		if (this.has_compare) {
			return a.compare(b);
		}
		if (a > b) {
			return 1;
		} else if (b > a) {
			return -1;
		} else {
			return 0;
		}
	}

	/**
	 * Check if variable is an instance of this type
	 */
	public is(variable: any) {
		return ((typeof variable).toLowerCase() === this.safe) || (variable && (variable instanceof this.__constructor));
	}

	/**
	 * Check if constructor matches
	 */
	public match(constructor: any) {
		return constructor === this.__constructor;
	}
}