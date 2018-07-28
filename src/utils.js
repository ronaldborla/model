"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utilities
 */
var Utils = /** @class */ (function () {
    function Utils() {
        this.undefined = (function (undefined) {
            return undefined;
        })();
    }
    /**
     * To camel case
     */
    Utils.prototype.camelCase = function (str) {
        return str.replace(/[-_]+/g, ' ').replace(/(?:^\w|[A-Z]|\b\w|[\s-_]+)/g, function (match, index) {
            if (+match === 0) {
                return '';
            }
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    };
    /**
     * Extend object
     */
    Utils.prototype.extend = function (left, right, ignore) {
        var hasIgnore = this.isArray(ignore);
        this.forEach(right, function (value, name) {
            if (!hasIgnore || ignore.indexOf(name) < 0) {
                left[name] = value;
            }
        });
        return left;
    };
    /**
     * Flatten array of string
     */
    Utils.prototype.flatten = function (data) {
        var _this = this;
        var flattened = {
            __flattened: true
        };
        if (!this.isUndefined(data)) {
            var keys_1 = [];
            (data || []).forEach(function (item) {
                var pos = item.indexOf('.'), left = (pos >= 0) ? item.substr(0, pos) : item, right = (pos >= 0) ? item.substr(pos + 1) : '';
                if (right) {
                    if (_this.isUndefined(flattened[left])) {
                        flattened[left] = [];
                    }
                    if (flattened[left] !== true) {
                        if (keys_1.indexOf(left) < 0) {
                            keys_1.push(left);
                        }
                        flattened[left].push(right);
                    }
                }
                else {
                    flattened[left] = true;
                }
            });
            keys_1.forEach(function (key) {
                if (flattened[key] !== true) {
                    flattened[key] = _this.flatten(flattened[key]);
                }
            });
        }
        return flattened;
    };
    /**
     * Loop through object
     */
    Utils.prototype.forEach = function (object, callback) {
        for (var o in object) {
            if (object.hasOwnProperty(o)) {
                if (callback.apply(object, [object[o], o, object]) === false) {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * Get parent constructor
     */
    Utils.prototype.getParent = function (constructor) {
        return (Object.getPrototypeOf(constructor.prototype) || {}).constructor;
    };
    /**
     * Check if variable is an array
     */
    Utils.prototype.isArray = function (variable) {
        return variable && (variable.constructor === Array);
    };
    /**
     * Check if function
     */
    Utils.prototype.isFunction = function (variable) {
        return !!(variable && variable.constructor && variable.call && variable.apply);
    };
    /**
     * Check if object
     */
    Utils.prototype.isObject = function (variable) {
        return typeof variable === 'object';
    };
    /**
     * Check if regex
     */
    Utils.prototype.isRegExp = function (variable) {
        return variable instanceof RegExp;
    };
    /**
     * Check if string
     */
    Utils.prototype.isString = function (variable) {
        return (typeof variable === 'string') || (variable instanceof String);
    };
    /**
     * Is undefined
     */
    Utils.prototype.isUndefined = function (variable) {
        return variable === this.undefined;
    };
    return Utils;
}());
exports.Utils = Utils;
var utils = new Utils();
exports.default = utils;
