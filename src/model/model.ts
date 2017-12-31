import { __ 	 } from './config';
import { utils } from './utils';

/**
 * The Model
 */
export class Model {

	/**
	 * The Model constructor
	 */
	constructor() {
		this[__] = {
			attributes: {},
			listeners: {}
		};
		this.constructor.schema.applyDefaults(this);
	}

  /**
   * Emit an event
   */
  public emit(name: string, args: any, source?: any) {
		return utils.emit().apply(this, [name, args, source]);
  }

	/**
	 * Fire an event
	 */
	public fire(name: string, args: any, source?: any) {
		return utils.fire().apply(this, [name, args, source]);
	}

	/**
	 * Load attributes
	 */
	public load(data?: any) {
		utils.forEach(data || {}, (value, key) => {
			if (this.constructor.schema.hasKey(key) || this.constructor.schema.hasVirtual(key, 'set')) {
				this[key] = value;
			}
		});
		return this.fire('load');
	}

	/**
	 * Listen to an event
	 */
	public on(name: string, callback: any) {
		return utils.on().apply(this, [name, callback]);
	}

	/**
	 * To string
	 */
	public toJSON(ignore?: any, replacer?: any, space?: number) {
		return JSON.stringify(this.toObject(ignore), replacer, space);
	}

	/**
	 * Convert to object
	 */
	public toObject(ignore?: any) {
		let object = {},
				schema = this.constructor.schema;
		if (!ignore || !ignore.__flattened) {
			ignore = utils.flattenIgnore(ignore);
		}
		schema.all_keys.forEach((key) => {
			if (ignore[key.name] !== true) {
				let value = this[key.name];
				if (value && utils.isFunction(value.toObject)) {
					value = value.toObject(ignore[key.name]);
				}
				if (!utils.isUndefined(value)) {
					object[key.name] = value;
				}
			}
		});
		if ((schema.options.toObject || {}).virtuals === true) {
			schema.virtuals.__keys.forEach((key_name) => {
				if (ignore[key_name] !== true && (utils.isFunction(schema.virtuals[key_name].get) || utils.isFunction(schema.virtuals[key_name]))) {
					let value = this[key_name];
					if (value && utils.isFunction(value.toObject)) {
						value = value.toObject(ignore[key_name]);
					}
					if (!utils.isUndefined(value)) {
						object[key_name] = value;
					}
				}
			});
		}
		return object;
	}

	/**
	 * To string
	 */
	public toString() {
		return this.toJSON();
	}
}