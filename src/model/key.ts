import { Schema } from './schema';
import { Type		} from './type';


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
	public default: any = null;

	/**
	 * Key name
	 */
	public name: string = null;

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
		this.default = key.default || null;
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
				utils = this.schema.utils;
		// Fix type
		if (!(this.type instanceof Type)) {
			this.type = this.schema.model.type(this.type);
		}
		// Define attribute
		Object.defineProperty(this.schema.$constructor.prototype, name, {
			get: function() {
				let value = this.$attributes[name],
						mutator = this.constructor.$cache.mutators.get[name];
				if (utils.isUndefined(mutator)) {
					let fn = utils.camelCase(['get', name, 'attribute'].join(' '));
					mutator = 
						this.constructor.$cache.mutators.get[name] =
						utils.isFunction(this[fn]) ? fn : null;
				}
				if (mutator !== null) {
					value = this[mutator].apply(this, [value]);
				}
				return value;
			},
			set: function(value) {
				var prev = this.$attributes[name];
				// Evaluate
				// !! Use mutator here
				value = key.evaluate(value, this);
				this.$attributes[name] = value;
				return this;
			}
		});
		this.booted = true;
		return this;
	}

	/**
	 * Evaluate 
	 */
	public evaluate(value: any, model: any) {
		value = this.type.convert(value);
		return value;
	}
}