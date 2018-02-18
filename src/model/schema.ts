import { __  	 			} from './config';
import { Collection } from './collection';
import { Key 	 			} from './key';
import { Model 			} from './model';
import { ModelJS 		} from '../model'
import { Trait 			} from './trait';
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
	 * ModelJS
	 */
	private model: ModelJS = null;

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
		this.__keys = [];
		this.__keys.__index = {};
		this.inherited_keys.forEach((key) => {
			this.__keys.__index[key.name] = this.__keys.length;
			this.__keys.push(key);
		});
		this.keys.forEach((key) => {
			if (utils.isUndefined(this.__keys.__index[key.name])) {
				this.__keys.__index[key.name] = this.__keys.length;
				this.__keys.push(key);
			}
		});
		return this.__keys;
	}

	/**
	 * All methods
	 */
	public get all_methods() {
		return utils.unique(Object.keys(this.methods).concat(this.inherited_methods));
	}

	/**
	 * All statics
	 */
	public get all_statics() {
		return utils.unique(Object.keys(this.statics).concat(this.inherited_statics));
	}

	/**
	 * All virtuals
	 */
	public get all_virtuals() {
		return utils.unique(Object.keys(this.virtuals).concat(this.inherited_virtuals));
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
		let parent = this.parent || {},
				parent_keys = parent.keys || [],
				keys = [];
		(parent.inherited_keys || []).forEach((key) => {
			if (utils.isUndefined(parent_keys.__index[key.name])) {
				keys.push(key);
			}
		});
		return keys.concat(parent_keys);
	}

	/**
	 * Get inherited methods
	 */
	public get inherited_methods() {
		return this.getInherited('methods');
	}

	/**
	 * Get inherited statics
	 */
	public get inherited_statics() {
		return this.getInherited('statics');
	}

	/**
	 * Get inherited virtuals
	 */
	public get inherited_virtuals() {
		return this.getInherited('virtuals');
	}

	/**
	 * Get parent schema
	 */
	public get parent() {
		return (this.__constructor.inherits || {}).schema;
	}

	/**
	 * All traits
	 */
	public get traits() : Array<Trait> {
		return (this.options.traits || []).map((trait) => {
			return this.model.trait(trait);
		});
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
		let methods = {},
				statics = {},
				virtuals = {};
		this.traits.forEach((trait) => {
			utils.extend(methods, trait.methods);
			utils.extend(statics, trait.statics);
			utils.extend(virtuals, trait.virtuals);
		});
		utils.forEach(methods, (value, key) => {
			if (utils.isUndefined(this.methods[key])) {
				this.methods[key] = value;
			}
		});
		utils.forEach(statics, (value, key) => {
			if (utils.isUndefined(this.statics[key])) {
				this.statics[key] = value;
			}
		});
		utils.forEach(virtuals, (value, key) => {
			if (utils.isUndefined(this.virtuals[key])) {
				this.virtuals[key] = value;
			}
		});
		utils.forEach(this.methods, (value, key, object) => {
			if (utils.isFunction(value)) {
				this.__constructor.prototype[key] = value;
			}
		});
		utils.forEach(this.statics, (value, key, object) => {
			this.__constructor[key] = value;
		});
		this.__virtuals_keys = [];
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
			this.__virtuals_keys.push(key);
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
	 * Get inherited
	 */
	public getInherited(type) : Array<string> {
		let parent = this.parent;
		if (!parent) {
			return [];
		}
		let parent_items = Object.keys(parent[type]) || [],
				items = [];
		(parent.getInherited(type) || []).forEach((item) => {
			if (utils.isUndefined(parent[type][item])) {
				items.push(item);
			}
		});
		return items.concat(parent_items);
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
	 * Use a trait
	 */
	public use(traits: any) {
		if (utils.isUndefined(traits)) {
			throw new Error('At least one `trait` is required');
		}
		if (utils.isUndefined(this.options.traits)) {
			this.options.traits = [];
		}
		if (!utils.isFunction(traits.forEach)) {
			traits = [traits];
		}
		traits.forEach((trait) => {
			this.options.traits.push(trait);
		});
		return this;
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