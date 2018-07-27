"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
/**
 * Type
 */
var Type = /** @class */ (function () {
    function Type(key, Constructor) {
        this.key = key;
        if (!utils_1.default.isFunction(Constructor)) {
            throw new this.key.schema.modeljs.Error('Type must be a constructor');
        }
        this.Constructor = Constructor;
        this.hasCompare = utils_1.default.isFunction(this.Constructor.prototype.compare);
        this.name = this.Constructor.name;
        this.safe = this.name.toLowerCase();
    }
    /**
     * Cast
     */
    Type.prototype.cast = function (value, options) {
        if (value === null) {
            return value;
        }
        if (!this.is(value)) {
            value = utils_1.default.isUndefined(options) ?
                new this.Constructor(value) :
                new this.Constructor(value, options);
        }
        return value;
    };
    /**
     * Compare
     * Compare two values
     * @return -1 if a is less than b, 1 if a is greater than b, 0 if equal
     */
    Type.prototype.compare = function (a, b) {
        if (this.hasCompare) {
            return a.compare(b);
        }
        if (a > b) {
            return 1;
        }
        if (b > a) {
            return -1;
        }
        return 0;
    };
    /**
     * Check if value is instance of this type
     */
    Type.prototype.is = function (value) {
        return value && ((value instanceof this.Constructor) ||
            (value.constructor.name === this.Constructor.name) ||
            ((typeof value).toLowerCase() === this.safe));
    };
    return Type;
}());
exports.default = Type;
