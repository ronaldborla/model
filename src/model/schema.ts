import { Key } from './key';

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
	private $constructor: any;

	/**
	 * Booted up
	 */
	private booted: boolean = false;

	/**
	 * Schema constructor
	 */
	constructor(keys: object) {
		let index = 0;
		this.keys.$index = {};
		this.utils.forEach(keys, (key, name) => {
			var key_instance = new Key(this, name, key);
			this.keys.$index[key_instance.name] = index++;
			this.keys.push(key_instance);
		});
	}

	/** 
	 * Get ModelJS instance
	 */
	public get model() {
		return this.constructor.model;
	}

	/**
	 * Get utils
	 */
	public get utils() {
		return this.model.utils;
	}

	/**
	 * Boot schema
	 */
	public boot() {
		if (this.booted) {
			return this;
		}
		let utils = this.utils;
		if (this.$constructor.inherits) {
			let inherits = this.$constructor.inherits;
			// Boot dependency if not yet booted
			if (!utils.isUndefined(inherits) && !utils.isFunction(inherits)) {
				this.$constructor.inherits = this.model.schemas[inherits].boot().$constructor;
			}
			utils.inherit(this.$constructor.inherits, this.$constructor);
		}
		// Extend constructor
		this.extend(this, function(constructor: any) {
			this.boot = boot;
			this.load = load;

			////////

			/**
			 * Boot model
			 */
			function boot() {
				this.constructor.$cache = {
					mutators: {
						get: {},
						set: {}
					}
				};
				this.$attributes = {};
				this.$listeners = {};
			}

			/**
			 * Load attributes
			 */
			function load(data) {
				utils.forEach(data || {}, (value, key) => {
					this[key] = value;
				});
				return this;
			}
		});
		this.booted = true;
		return this;
	}

	/**
	 * Define a model
	 */
	public define(constructor: any) {
		constructor.isModel = true;
		this.$constructor = constructor;
		return constructor.schema = this;
	}

	/**
	 * Extend a constructor
	 */
	public extend(schema: any, define?: any) {
		// Extend constructor prototype
		this.utils.forEach(schema.methods, (value, key, object) => {
			schema.$constructor.prototype[key] = value;
		});
		this.utils.forEach(schema.statics, (value, key, object) => {
			schema.$constructor[key] = value;
		});
		this.utils.forEach(schema.virtuals, (virtual, key) => {
			let definition: any = {};
			if (this.utils.isFunction(virtual)) {
				definition.get = virtual;
			} else {
				if (!virtual) {
					virtual = {};
				}
				if (this.utils.isFunction(virtual.get)) {
					definition.get = virtual.get;
				}
				if (this.utils.isFunction(virtual.set)) {
					definition.set = virtual.set;
				}
			}
			if (this.utils.isFunction(definition.get) || this.utils.isFunction(definition.set)) {
				Object.defineProperty(schema.$constructor.prototype, key, definition);
			}
		});
		if (!this.utils.isUndefined(define)) {
			define.apply(schema.$constructor.prototype, [schema.$constructor]);
		}
		return this;
	}

	/**
	 * Inherit a model
	 */
	public inherit(model: any) {
		this.$constructor.inherits = model;
		return this;
	}

	/**
	 * Get key
	 */
	public getKey(name: string) {
		return this.keys[this.keys.$index[name]];
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
	public super(model: any, name: string, args?: any) {
		if (name === 'constructor') {
			return this.$constructor.inherits.apply(model, args || []);
		} else {
			return this.$constructor.inherits.prototype[name].apply(model, args || []);
		}
	}

	/**
	 * Setup a virtual method
	 */
	public virtual(method: string, name: string, callback: any) {
		if (this.utils.isUndefined(this.virtuals[name])) {
			this.virtuals[name] = {};
		} else if (this.utils.isFunction(this.virtuals[name])) {
			this.virtuals[name] = {
				get: this.virtuals[name]
			};
		}
		this.virtuals[name][method] = callback;
		return this;
	}
}