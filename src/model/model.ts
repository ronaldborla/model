import { Collection } from './collection';
import { Schema 		} from './schema';
import { Type 			} from './type';
import { Utils  		} from './utils';

/**
 * The ModelJS class
 */
export class Model {

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
	 * Types
	 */
	public Types: object = {};

	/**
	 * The utilities
	 */
	public utils: Utils = new Utils();

	/**
	 * Booted
	 */
	private booted: boolean = false;

	/**
	 * Models
	 */
	private models: object = {};

	/**
	 * Schemas
	 */
	private schemas: object = {};

	/**
	 * Model constructor
	 */
	constructor() {
		this.Collection.model 
			= this.Schema.model 
			= this.utils.model 
			= this;
		this.Types.$keys = [];
		this.Types.$length = 0;
		// Set keys
		this.schemas.$keys = [];
		// Initial types are Javasript Native types
    ['Array', 'Boolean', 'Date', 'Number', 'Object', 'String'].forEach((type) => {
    	this.type(type, window[type]);
    });
	}

	/** 
	 * Boot up
	 * Models need to be booted up so that the dependencies within schemas can be properly handled
	 */
	public boot() {
		if (this.booted) {
			return this;
		}
		// Boot schemas
		this.schemas.$keys.forEach((name) => {
			this.models[name] = this.schemas[name].boot().$constructor;
			this.type(name, this.models[name]);
		});
		// Boot keys
		this.schemas.$keys.forEach((name) => {
			this.schemas[name].keys.forEach((key) => {
				key.boot();
			});
		});
		this.booted = true;
		return this;
	}

	/**
	 * Register or retrieve a Model
	 */
	public model(name: string, schema?: Schema, constructor?: any) {
		if (this.utils.isUndefined(schema)) {
			if (!this.booted) {
				throw new Error('ModelJS must be booted first');
			}
			return this.models[name];
		} else {
			constructor.$name = name;
			this.schemas[name] = schema.define(constructor);
			this.schemas.$keys.push(name);
			return this.schemas[name];
		}
	}

	/**
	 * Register/retrieve type
	 */
	public type(name: string, constructor?: any) {
		if (this.utils.isUndefined(constructor)) {
			if (this.utils.isFunction(name)) {
				for (let i = 0; i < this.Types.$length; i++) {
					let type = this.Types[this.Types.$keys[i]];
					if (type.match(name)) {
						return type;
					}
				}
			}
			if (this.utils.isUndefined(this.Types[name])) {
				throw new Error('Type `' + name + '` does not exist');
			}
			return this.Types[name];
		} else {
			if (!this.utils.isUndefined(this.Types[name])) {
				throw new Error('Type `' + name + '` already exists');
			}
			this.Types[name] = new Type(name, constructor);
			this.Types.$keys.push(name);
			this.Types.$length++;
			return this;
		}
	}
}