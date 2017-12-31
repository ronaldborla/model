import { __ 	 } from './config';
import { Model } from './model';
import { utils } from './utils';

/**
 * Model Collection
 */
export class Collection extends Array {

	/**
	 * The Collection constructor
	 */
	constructor() {
		this[__] = {
			attributes: {},
			listeners: {}
		};
		this.constructor.schema.applyDefaults(this);
	}

	/**
	 * Cast a variable into this collection's constructor
	 */
	private cast(variable: any) {
		let item = this.type.cast(variable);
		if (item instanceof Model) {
			item[__].collection = this;
		}
		return item;
	}

	/**
	 * Collection model
	 */
	public get model() {
		return utils.model.models[this.constructor.__constructor] || Model;
	}

	/**
	 * Type
	 */
	public get type() {
		return utils.model.types[this.constructor.__constructor || 'Model'];
	}

	/**
	 * Concatenate arrays
	 */
	public concat() {
		for (let i = 0; i < arguments.length; i++) {
			this.push.apply(this, arguments[i]);
		}
		return this;
	}

  /**
   * Emit an event
   */
  public emit(name: string, args: any, source?: any) {
		return utils.emit().apply(this, [name, args, source]);
  }

  /**
   * Override fill
   */
  public fill() {
  	arguments[0] = this.cast(arguments[0]);
  	return Array.prototype.fill.apply(this, arguments);
  }

	/**
	 * Fire an event
	 */
	public fire(name: string, args: any, source?: any) {
		return utils.fire().apply(this, [name, args, source]);
	}

	/**
	 * Load
	 */
	public load(items?: any) {
		this.push.apply(this, items || []);
		return this.fire('load');
	}

	/**
	 * Listen to an event
	 */
	public on(name: string, callback: any) {
		return utils.on().apply(this, [name, callback]);
	}

	/**
	 * Override push
	 */
	public push() {
		for (let i = 0; i < arguments.length; i++) {
			arguments[i] = this.cast(arguments[i]);
		}
		return Array.prototype.push.apply(this, arguments);
	}

	/**
	 * Override splice
	 */
	public splice() {
		if (arguments.length > 2) {
			for (let i = 2; i < arguments.length; i++) {
				arguments[i] = this.cast(arguments[i]);
			}
		}
		return Array.prototype.splice.apply(this, arguments);
	}

	/**
	 * Convert to JSON
	 */
	public toJSON(ignore?: any, replacer?: any, space?: number) {
		return JSON.stringify(this.toObject(ignore), replacer, space);
	}

	/**
	 * Convert to object
	 */
	public toObject(ignore?: any) {
		if (!ignore || !ignore.__flattened) {
			ignore = utils.flattenIgnore(ignore);
		}
		return this.map((item) => {
			return utils.isFunction(item.toObject) ? item.toObject(ignore) : item;
		});
	}

	/**
	 * To string
	 */
	public toString() {
		return this.toJSON();
	}

	/**
	 * Override unshift
	 */
	public unshift() {
		for (let i = 0; i < arguments.length; i++) {
			arguments[i] = this.cast(arguments[i]);
		}
		return Array.prototype.unshift.apply(this, arguments);
	}
}