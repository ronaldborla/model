import { __ } from './config';

/**
 * Model utilities
 */
class Utils {

	/**
	 * Undefined
	 */
	public undefined: any;

	/**
	 * The constructor
	 */
	constructor() {
		this.undefined = (function(undefined) {
			return undefined;
		})();
	}

  /**
   * To camel case
   */
  public camelCase(str: string) {
    return str.replace(/[-_]+/g, ' ').replace(/(?:^\w|[A-Z]|\b\w|[\s-_]+)/g, function(match, index) {
      if (+match === 0) {
        return ''; // or if (/\s+/.test(match)) for white spaces
      }
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

  /**
   * Emit an event
   */
  public emit() {
  	let utils = this;
  	return function(name: string, args: any, source?: any) {
			if (utils.isUndefined(source)) {
				source = this;
			}
			this.fire(name, args, source);
			if (!utils.isUndefined(this[__].parent) && utils.isFunction(this[__].parent.emit)) {
				this[__].parent.emit(name, args, source);
			}
			if (!utils.isUndefined(this[__].collection) && utils.isFunction(this[__].collection.emit)) {
				this[__].collection.emit(name, args, source);
			}
			return this;
  	};
  }

	/**
	 * Extend
	 */
	public extend(left: object, right: object, ignore?: any) {
    this.forEach(right, (value, name) => {
    	if (this.isUndefined(ignore) || ignore.indexOf(name) < 0) {
      	left[name] = value;
    	}
    });
    return left;
	}

	/**
	 * Fire an event
	 */
	public fire() {
		let utils = this;
		return function(name: string, args: any, source?: any) {
			if (!utils.isUndefined((this[__].listeners || {})[name])) {
				let e = { 
					name: name,
					source: utils.isUndefined(source) ? this : source
				};
				args = (args || []).slice();
				args.unshift(e);
				(this[__].listeners[name] || []).forEach((callback) => {
					callback.apply(this, args || []);
				});
			}
			return this;
		};
	}

	/**
	 * Flatten ignore
	 */
	public flattenIgnore(ignore: any) {
		let flattened = {
			__flattened: true
		};
		if (!this.isUndefined(ignore)) {
			let child_keys = [];
			(ignore || []).forEach((attribute) => {
				let pos = attribute.indexOf('.'),
						left = (pos >= 0) ? attribute.substr(0, pos) : attribute,
						right = (pos >= 0) ? attribute.substr(pos + 1) : '';
				if (right) {
					if (this.isUndefined(flattened[left])) {
						flattened[left] = [];
					}
					if (flattened[left] !== true) {
						if (child_keys.indexOf(left) < 0) {
							child_keys.push(left);
						}
						flattened[left].push(right);
					}
				} else {
					flattened[left] = true;
				}
			});
			child_keys.forEach((key) => {
				if (flattened[key] !== true) {
					flattened[key] = this.flattenIgnore(flattened[key]);
				}
			});
		}
		return flattened;
	}

	/**
	 * Foreach
	 */
	public forEach(object: object, callback: any) {
    for (let o in object) {
      if (object.hasOwnProperty(o)) {
        if (callback.apply(object, [object[o], o, object]) === false) {
          return false;
        }
      }
    }
    return true;
	}

	/**
	 * Inherit a protoype
	 */
	public inherit(parent: any, child: any, ignore?: any) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
    this.extend(child, parent, ignore);
    return child;
	}

	/**
	 * Is function
	 */
	public isFunction(variable: any) {
    return !!(variable && variable.constructor && variable.call && variable.apply);
	}

	/**
	 * Is undefined
	 */
	public isUndefined(variable: any) {
		return variable === this.undefined;
	}

	/**
	 * Listen to an event
	 */
	public on() {
		let utils = this;
		return function(name: string, callback: any) {
			let object = this;
			if (!utils.isFunction(callback)) {
				throw new Error('Callback parameter must be a function');
			}
			if (utils.isUndefined(this[__].listeners)) {
				this[__].listeners = {};
			}
			if (utils.isUndefined(this[__].listeners[name])) {
				this[__].listeners[name] = [];
				this[__].listeners[name].__index = 0;
			}
			let id = callback.id = this[__].listeners[name].__index++;
			this[__].listeners[name].push(callback);
			return function() {
				let index = -1,
						length = object[__].listeners[name].length;
				for (let i = 0; i < length; i++) {
					if (object[__].listeners[name][i].id === id) {
						index = i;
						break;
					}
				}
				if (index >= 0) {
					object[__].listeners[name].splice(index, 1);
				}
				return object;
			};
		};
	}

	/**
	 * Get unique
	 */
	public unique(array: Array<any>, callback?: any) {
		let has_callback = this.isFunction(callback),
				keys = {},
				unique = [];
		(array || []).forEach((item, i, list) => {
			let key = has_callback ? callback(item, i, list) : item;
			if (keys[key] !== true) {
				unique.push(item);
				keys[key] = true
			}
		});
		return unique;
	}
}

/**
 * Export instance
 */
export let utils = new Utils();