import { __  	 			} from './config';
import { Collection } from './collection';
import { Key 	 			} from './key';
import { Model 			} from './model';
import { utils 			} from './utils';

/**
 * The Model Schema class
 */
export class Schema {

	/**
	 * The Key
	 */
	public static Key: any = Key;

	/**
	 * The keys
	 */
	public keys: Array<Key> = [];

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
	 * The constructor
	 */
	private __constructor: any;

	/**
	 * Booted up
	 */
	private booted: boolean = false;

	/**
	 * Model
	 */
	private model: Model = null;

	/**
	 * Options
	 */
	private options: object = {};

	/**
	 * Schema type
	 */
	private type: string = 'model';

	/**
	 * Cache
	 */
	private cache: object = {
		mutators: {
			get: {},
			set: {}
		}
	};

	/**
	 * Schema constructor
	 */
	constructor(constructor: any, keys?: object, options?: object) {
		constructor.schema = this;
		this.__constructor = constructor;
		this.options = options || {};
		if (!utils.isUndefined(keys) && keys) {
			let index = 0;
			this.keys.__index = {};
			utils.forEach(keys, (key, name) => {
				let key_instance = new Key(this, name, key);
				this.keys.__index[key_instance.name] = index++;
				this.keys.push(key_instance);
			});
		}
	}

	/**
	 * All keys
	 */
	public get all_keys() {
		if (!utils.isUndefined(this.__keys)) {
			return this.__keys;
		}
		this.__keys = [].concat(this.inherited_keys, this.keys);
		this.__keys.__index = {};
		this.__keys.forEach((key, i) => {
			this.__keys.__index[key.name] = i;
		});
		return this.__keys;
	}

	/**
	 * Base constructor
	 */
	public get base_constructor() {
		switch (this.type) {
			case 'collection':
				return Collection;
			case 'model':
				return Model;
		}
		return utils.undefined;
	}

	/**
	 * Constructors
	 */
	public get constructors() {
		return this.model.schemas[this.type + 's'];
	}

	/**
	 * Inherited keys
	 */
	public get inherited_keys() {
		let schema = (this.__constructor.inherits || {}).schema || {},
				parent_keys = schema.keys || [],
				keys = [];
		(schema.inherited_keys || []).forEach((key) => {
			if (utils.isUndefined(parent_keys.__index[key.name])) {
				keys.push(key);
			}
		});
		return keys.concat(parent_keys);
	}

	/**
	 * Apply defaults
	 */
	public applyDefaults(object) {
		this.all_keys.forEach((key) => {
			if (!utils.isUndefined(key.default)) {
				if (utils.isFunction(key.default)) {
					object[key.name] = key.default.apply(object, [key]);
				} else {
					object[key.name] = key.default;
				}
			}
		});
		return object;
	}

	/**
	 * Boot schema
	 */
	public boot() {
		if (this.booted) {
			return this;
		}
		if (utils.isUndefined(this.__constructor.inherits)) {
			this.__constructor.inherits = this.base_constructor;
			if (utils.isUndefined(this.__constructor.inherits)) {
				throw new Error('Invalid schema type: ' + this.type);
			}
		}
		if (!utils.isFunction(this.__constructor.inherits)) {
			let parent = this.constructors[this.__constructor.inherits];
			if (utils.isUndefined(parent)) {
				throw new Error('Invalid schema type: ' + this.type);
			}
			this.__constructor.inherits = (parent instanceof Schema) ? parent.boot().__constructor : parent;
		}
		utils.inherit(this.__constructor.inherits, this.__constructor, [
			'__constructor',
			'__name',
			'inherits',
			'schema',
			'type'
		]);
		// Define properties
		utils.forEach(this.methods, (value, key, object) => {
			if (utils.isFunction(value)) {
				this.__constructor.prototype[key] = value;
			}
		});
		utils.forEach(this.statics, (value, key, object) => {
			this.__constructor[key] = value;
		});
		this.virtuals.__keys = [];
		utils.forEach(this.virtuals, (virtual, key) => {
			let definition: any = {};
			if (utils.isFunction(virtual)) {
				definition.get = virtual;
			} else {
				if (!virtual) {
					virtual = {};
				}
				if (utils.isFunction(virtual.get)) {
					definition.get = virtual.get;
				}
				if (utils.isFunction(virtual.set)) {
					definition.set = virtual.set;
				}
			}
			if (utils.isFunction(definition.get) || utils.isFunction(definition.set)) {
				Object.defineProperty(this.__constructor.prototype, key, definition);
			}
			this.virtuals.__keys.push(key);
		});
		this.booted = true;
		return this;
	}

	/**
	 * Define a model
	 */
	public define(modeljs: any, name: string, type?: string, model?: string) {
		this.__constructor.__name = name;
		this.model = modeljs;
		if (!utils.isUndefined(type)) {
			this.type = type;
		}
		if (this.type === 'collection') {
			this.__constructor.__constructor = model || 'Model';
		}
		return this;
	}

	/**
	 * Has key
	 */
	public hasKey(name: string) {
		return !utils.isUndefined(this.getKey(name));
	}

	/**
	 * Has virtual
	 */
	public hasVirtual(name: string, method?: string = 'get') {
		if (method === 'get') {
			return utils.isFunction(this.virtuals[name]) || utils.isFunction(this.virtuals[name].get);
		} else if (method === 'set') {
			return !utils.isUndefined(this.virtuals[name]) && utils.isFunction(this.virtuals[name].set);
		} else {
			return false;
		}
	}

	/**
	 * Inherit a parent constructor
	 */
	public inherit(parent: any) {
		this.__constructor.inherits = parent;
		return this;
	}

	/**
	 * Get key
	 */
	public getKey(name: string) {
		return this.all_keys[this.all_keys.__index[name]];
	}

	/**
	 * Setup a method
	 */
	public method(name: string, callback: any) {
		this.methods[name] = callback;
		return this;
	}

	/**
	 * Setup a static method
	 */
	public static(name: string, callback: any) {
		this.statics[name] = callback;
		return this;
	}

	/**
	 * Call super method
	 */
	public super(object: any, name: string, args?: any) {
		if (name === 'constructor') {
			return this.__constructor.inherits.apply(object, args || []);
		} else {
			return this.__constructor.inherits.prototype[name].apply(object, args || []);
		}
	}

	/**
	 * Setup a virtual method
	 */
	public virtual(name: string, callback: any, method?: string = 'get') {
		if (method !== 'get' && method !== 'set') {
			throw new Error('Invalid virtual method: ' + method);
		}
		if (utils.isUndefined(this.virtuals[name])) {
			this.virtuals[name] = {};
		} else if (utils.isFunction(this.virtuals[name])) {
			this.virtuals[name] = {
				get: this.virtuals[name]
			};
		}
		this.virtuals[name][method] = callback;
		return this;
	}
}