"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
/**
 * Collection
 */
var Collection = /** @class */ (function () {
    function Collection(items) {
        /**
         * Private storage
         */
        this.__ = {
            parent: null
        };
        if (!utils_1.default.isUndefined(items)) {
            this.load(items);
        }
    }
    /**
     * Placeholder methods
     */
    Collection.prototype.cast = function (item) {
        return item;
    };
    Collection.prototype.load = function (items) {
        return this;
    };
    Collection.prototype.toObject = function (include, exclude) {
        return {};
    };
    Collection.prototype.toJSON = function (exclude, include, replacer, space) {
        return '';
    };
    /**
     * Is Collection
     */
    Collection.isCollection = true;
    return Collection;
}());
exports.default = Collection;
/**
 * For some reason, "extends" in typescript doesn't correctly extend an Array
 * Therefore, this needs to be done in a different manner
 * The "extends Array" statement above is for Typescript consistency
 */
/**
 * Extend Array
 */
Collection.prototype = Object.create(Array.prototype);
Collection.prototype.constructor = Collection;
/**
 * Collection functions must be declared outside the Class definition
 */
Collection.prototype.cast = cast;
Collection.prototype.concat = concat;
Collection.prototype.load = load;
Collection.prototype.push = push;
Collection.prototype.splice = splice;
Collection.prototype.toJSON = toJSON;
Collection.prototype.toObject = toObject;
Collection.prototype.toString = toString;
Collection.prototype.unshift = unshift;
////////
/**
 * Cast an item
 */
function cast(item) {
    var Model = this.constructor.Model;
    if (!(item instanceof Model)) {
        item = new Model(item);
    }
    item.__.parent = this;
    return item;
}
/**
 * Override concat
 */
function concat() {
    var length = arguments.length;
    for (var i = 0; i < length; i++) {
        this.push.apply(this, arguments[i]);
    }
    return this;
}
/**
 * Load items
 */
function load(items) {
    this.push.apply(this, items || []);
    return this;
}
/**
 * Override push
 */
function push() {
    var _this = this;
    return Array.prototype.push.apply(this, Array.prototype.map.apply(arguments, [function (item) {
            return _this.cast(item);
        }]));
}
/**
 * Override splice
 */
function splice() {
    var length = arguments.length;
    if (length > 2) {
        for (var i = 2; i < length; i++) {
            arguments[i] = this.cast(arguments[i]);
        }
    }
    return Array.prototype.splice.apply(this, arguments);
}
/**
 * To JSON
 */
function toJSON(exclude, include, replacer, space) {
    return JSON.stringify(this.toObject(exclude, include), replacer, space);
}
/**
 * Convert to object
 */
function toObject(include, exclude) {
    if (include && !include.__flattened) {
        include = utils_1.default.flatten(include);
    }
    if (exclude && !exclude.__flattened) {
        exclude = utils_1.default.flatten(exclude);
    }
    return this.map(function (item) {
        return item.toObject(include, exclude);
    });
}
/**
 * To string
 */
function toString() {
    return this.toJSON();
}
/**
 * Override unshift
 */
function unshift() {
    var length = arguments.length;
    for (var i = 0; i < length; i++) {
        arguments[i] = this.cast(arguments[i]);
    }
    return Array.prototype.unshift.apply(this, arguments);
}
