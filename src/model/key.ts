import { __ 				} from './config';
import { Collection } from './collection';
import { Model  		} from './model';
import { Schema 		} from './schema';
import { Type				} from './type';
import { utils 			} from './utils';

/**
 * Model Key class
 */
export class Key {

	/**
	 * Type
	 */
	public static Type: any = Type;

	/**
	 * Default value
	 */
	public default: any = utils.undefined;

	/**
	 * Key name
	 */
	public name: string = null;

	/**
	 * Key options
	 */
	public options: any = utils.undefined;

	/**
	 * The schema
	 */
	public schema: Schema = null;

	/**
	 * The type
	 */
	public type: Type = null;

	/**
	 * Booted
	 */
	private booted: boolean = false;

	/**
	 * Key constructor
	 */
	constructor(schema: Schema, name: string, key: any) {
		this.schema = schema;
		this.name = name;
		this.default = key.default;
		this.options = key.options;
		this.type = key.type || key;
	}

	/**
	 * Boot key
	 */
	public boot() {
		if (this.booted) {
			return this;
		}
		let key = this,
				name = this.name,
				schema = this.schema;
		// Fix type
		if (!(this.type instanceof Type)) {
			this.type = schema.model.type(this.type);
		}
		// Define attribute
		Object.defineProperty(schema.__constructor.prototype, name, {
			get: function() {
				return callMutator.apply(this, ['get', this[__].attributes[name]]);
			},
			set: function(value) {
				let previous = this[__].attributes[name];
				value = setParent(key.type.cast(value, key.options), this);
				this[__].attributes[name] = value = callMutator.apply(this, ['set', value]);
				return this.fire('setAttribute', [name, value, previous]);
			}
		});
		this.booted = true;
		return this;

		/**
		 * Call mutator
		 */
		function callMutator(method: string, value: any) {
			let mutator = schema.cache.mutators[method][name];
			if (utils.isUndefined(mutator)) {
				let fn = utils.camelCase([method, name, 'attribute'].join(' '));
				mutator = 
					schema.cache.mutators[method][name] =
					utils.isFunction(this[fn]) ? fn : null;
			}
			if (mutator !== null) {
				value = this[mutator].apply(this, [value]);
			}
			return value;
		}

		/**
		 * Set Model or Collection parent
		 */
		function setParent(value, model) {
			if (value && ((value instanceof Model) || (value instanceof Collection))) {
				value[__].parent = model;
			}
			return value;
		}
	}
}