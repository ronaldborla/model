import { Schema } from './schema';
import { utils 	} from './utils';

/**
 * Trait
 */
export class Trait {

	/**
	 * Trait name
	 */
	public name: string = '';

	/**
	 * Methods
	 */
	public methods: object = {};

	/**
	 * Statics
	 */
	public statics: object = {};

	/**
	 * Virtuals
	 */
	public virtuals: object = {};

	/**
	 * Trait constructor
	 */
	constructor() {
		// Do nothing
	}

	/**
	 * Method
	 */
	public method() {
		return Schema.prototype.method.apply(this, arguments);
	}

	/**
	 * Static
	 */
	public static() {
		return Schema.prototype.static.apply(this, arguments);
	}

	/**
	 * Virtual
	 */
	public virtual() {
		return Schema.prototype.virtual.apply(this, arguments);
	}
}