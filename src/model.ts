import { Collection } from './model/collection';
import { Model 			} from './model/model';
import { Schema 		} from './model/schema';
import { Trait 			} from './model/trait';
import { Type 			} from './model/type';
import { utils  		} from './model/utils';

/**
 * The ModelJS class
 */
export class ModelJS {

	/**
	 * The Collection
	 */
	public Collection: any = Collection;

	/**
	 * The Model
	 */
	public Model: any = Model;

	/**
	 * Set Schema so that it can be accessible by modeljs.Schema
	 */
	public Schema: any = Schema;

	/**
	 * Trait
	 */
	public Trait: any = Trait;

	/**
	 * Traits
	 */
	public traits: object = {};

	/**
	 * Types
	 */
	public types: object = {};

	/**
	 * The utilities
	 */
	public utils: any = utils;

	/**
	 * Booted
	 */
	private booted: boolean = false;

	/**
	 * Collections
	 */
	private collections: object = {};

	/**
	 * Models
	 */
	private models: object = {};

	/**
	 * Schemas
	 */
	private schemas: object = {
		collections: {},
		models: {}
	};

	/**
	 * Model constructor
	 */
	constructor() {
		utils.model = this;
		this.schemas.collections.__keys = [];
		this.schemas.models.__keys = [];
		this.traits.__keys = [];
		this.traits.__length = 0;
		this.types.__keys = [];
		this.types.__length = 0;
		// Initial types are Javascript Native types
    this.type('Array', Array);
    this.type('Boolean', Boolean);
    this.type('Date', Date);
    this.type('Number', Number);
    this.type('Object', Object);
    this.type('String', String);
    // Set Collection and Model
    this.type('Model', Model);
    this.type('Collection', Collection);
	}

	/**
	 * Register
	 */
	private register(type: string, name: string, schema?: any, inherit?: string, model?: string) {
		let plural = type + 's';
		if (utils.isUndefined(schema)) {
			if (!this.booted) {
				throw new Error('modeljs must be booted first');
			}
			return this[plural][name];
		} else {
			if (!(schema instanceof Schema)) {
				throw new Error('schema must be an instance of `Schema`');
			}
			this.schemas[plural][name] = schema.define(this, name, type, model);
			this.schemas[plural].__keys.push(name);
			if (!utils.isUndefined(inherit)) {
				this.schemas[plural][name].inherit(inherit);
			}
			return this.schemas[plural][name];
		}
	}

	/** 
	 * Boot up
	 * Models need to be booted up so that the dependencies within schemas can be properly handled
	 */
	public boot() {
		if (this.booted) {
			return this;
		}
		// Boot models
		this.schemas.models.__keys.forEach((name) => {
			if (!utils.isUndefined(this.models[name])) {
				throw new Error('Model already exists: ' + name);
			}
			this.models[name] = this.schemas.models[name].boot().__constructor;
			this.type(name, this.models[name]);
		});
		// Boot collections
		this.schemas.collections.__keys.forEach((name) => {
			if (!utils.isUndefined(this.collections[name])) {
				throw new Error('Collection already exists: ' + name);
			}
			this.collections[name] = this.schemas.collections[name].boot().__constructor;
			this.type(name, this.collections[name]);
		})
		// Boot keys
		this.schemas.models.__keys.forEach((name) => {
			this.models[name].schema.keys.forEach((key) => {
				key.boot();
			});
		});
		this.booted = true;
		return this;
	}

	/**
	 * Define a collection
	 */
	public collection(name: string, schema?: any, model?: string, inherit?: string) {
		return this.register('collection', name, schema, inherit, model);
	}

	/**
	 * Register or retrieve a Model
	 */
	public model(name: string, schema?: any, inherit?: string) {
		return this.register('model', name, schema, inherit);
	}

	/**
	 * Register or retrieve a trait
	 */
	public trait(name: any, trait?: Trait) {
		if (utils.isUndefined(trait)) {
			if (utils.isUndefined(this.traits[name])) {
				throw new Error('Trait `' + name + '` does not exist');
			}
			return this.traits[name];
		} else {
			if (!utils.isUndefined(this.traits[name])) {
				throw new Error('Trait `' + name + '`already exists');
			}
			trait.name = name;
			this.traits[name] = trait;
			this.traits.__keys.push(name);
			this.traits.__length++;
			return this;
		}
	}

	/**
	 * Register/retrieve type
	 */
	public type(name: string, constructor?: any) {
		if (utils.isUndefined(constructor)) {
			if (utils.isFunction(name)) {
				for (let i = 0; i < this.types.__length; i++) {
					let type = this.types[this.types.__keys[i]];
					if (type.match(name)) {
						return type;
					}
				}
			}
			if (utils.isUndefined(this.types[name])) {
				throw new Error('Type `' + name + '` does not exist');
			}
			return this.types[name];
		} else {
			if (!utils.isUndefined(this.types[name])) {
				throw new Error('Type `' + name + '` already exists');
			}
			this.types[name] = new Type(name, constructor);
			this.types.__keys.push(name);
			this.types.__length++;
			return this;
		}
	}
}

/**
 * Export instance
 */
export let modeljs = new ModelJS();