/**
 * Model utilities
 */
export class Utils {

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
  public camelCase(str) {
    return str.replace(/[-_]+/g, ' ').replace(/(?:^\w|[A-Z]|\b\w|[\s-_]+)/g, function(match, index) {
      if (+match === 0) {
        return ''; // or if (/\s+/.test(match)) for white spaces
      }
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

	/**
	 * Extend
	 */
	public extend(left, right) {
    this.forEach(right, function(value, name) {
      left[name] = value;
    });
    return left;
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
	public inherit(parent: any, child: any) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
    this.extend(child, parent);
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
}