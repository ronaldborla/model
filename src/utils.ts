/**
 * Utilities
 */
export class Utils {

  /**
   * Undefined
   */
  public undefined: any;

  constructor() {
    this.undefined = ((undefined) => {
      return undefined;
    })();
  }

  /**
   * To camel case
   */
  camelCase(str: string): string {
    return str.replace(/[-_]+/g, ' ').replace(/(?:^\w|[A-Z]|\b\w|[\s-_]+)/g, function(match, index) {
      if (+match === 0) {
        return '';
      }
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

  /**
   * Extend object
   */
  extend(left: any, right: any, ignore?: Array<string>): any {
    const hasIgnore = this.isArray(ignore);
    this.forEach(right, (value: any, name: string) => {
      if (!hasIgnore || ignore.indexOf(name) < 0) {
        left[name] = value;
      }
    });
    return left;
  }

  /**
   * Flatten array of string
   */
  flatten(data: any): any {
    const flattened = {
      __flattened: true
    };
    if (!this.isUndefined(data)) {
      const keys = [];
      (data || []).forEach((item) => {
        const pos = item.indexOf('.'),
              left = (pos >= 0) ? item.substr(0, pos) : item,
              right = (pos >= 0) ? item.substr(pos + 1) : '';
        if (right) {
          if (this.isUndefined(flattened[left])) {
            flattened[left] = [];
          }
          if (flattened[left] !== true) {
            if (keys.indexOf(left) < 0) {
              keys.push(left);
            }
            flattened[left].push(right);
          }
        } else {
          flattened[left] = true;
        }
      });
      keys.forEach((key) => {
        if (flattened[key] !== true) {
          flattened[key] = this.flatten(flattened[key]);
        }
      });
    }
    return flattened;
  }

  /**
   * Loop through object
   */
  forEach(object: any, callback: any): boolean {
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
   * Get parent constructor
   */
  getParent(constructor: any): any {
    return (Object.getPrototypeOf(constructor.prototype) || {}).constructor;
  }

  /**
   * Check if variable is an array
   */
  isArray(variable: any): boolean {
    return variable && (variable.constructor === Array);
  }

  /**
   * Check if function
   */
  isFunction(variable: any): boolean {
    return !!(variable && variable.constructor && variable.call && variable.apply);
  }

  /**
   * Check if object
   */
  isObject(variable: any): boolean {
    return typeof variable === 'object';
  }

  /**
   * Check if regex
   */
  isRegExp(variable: any): boolean {
    return variable instanceof RegExp;
  }

  /**
   * Check if string
   */
  isString(variable: any): boolean {
    return (typeof variable === 'string') || (variable instanceof String);
  }

  /**
   * Is undefined
   */
  isUndefined(variable: any): boolean {
    return variable === this.undefined;
  }
}

const utils = new Utils();

export default utils;
