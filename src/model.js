"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
/**
 * Model
 */
var Model = /** @class */ (function () {
    function Model(data) {
        var _this = this;
        /**
         * Private storage
         */
        this.__ = {
            attributes: {},
            parent: null
        };
        this.constructor.schema.keys.forEach(function (key) {
            if (data && !utils_1.default.isUndefined(data[key.name])) {
                _this[key.name] = data[key.name];
            }
            else if (utils_1.default.isFunction(key.default)) {
                _this[key.name] = key.default();
            }
            else if (!utils_1.default.isUndefined(key.default)) {
                _this[key.name] = key.default;
            }
        });
    }
    /**
     * Load data
     */
    Model.prototype.load = function (data) {
        var _this = this;
        var schema = this.constructor.schema;
        if (!utils_1.default.isUndefined(data)) {
            utils_1.default.forEach(data, function (value, key) {
                if (!utils_1.default.isUndefined(value) && !utils_1.default.isUndefined(schema.cache.index.keys[key])) {
                    _this[key] = value;
                }
            });
        }
        return this;
    };
    /**
     * To JSON
     */
    Model.prototype.toJSON = function (exclude, include, replacer, space) {
        return this.toObject(exclude, include);
    };
    /**
     * Convert model to object
     */
    Model.prototype.toObject = function (include, exclude) {
        var _this = this;
        var object = {};
        if (include && !include.__flattened) {
            include = utils_1.default.flatten(include);
        }
        if (exclude && !exclude.__flattened) {
            exclude = utils_1.default.flatten(exclude);
        }
        this.constructor.schema.keys.forEach(function (key) {
            if (key.hidden !== true && key.name !== '__' && (!exclude || exclude[key.name] !== true)) {
                evaluate(key.name, _this[key.name]);
            }
        });
        if (include) {
            utils_1.default.forEach(include, function (children, key) {
                evaluate(key, _this[key]);
            });
        }
        return object;
        /**
         * Evaluate
         */
        function evaluate(key, value) {
            if (value && value.constructor && (value.constructor.isModel === true || value.constructor.isCollection === true)) {
                value = value.toObject((include && (typeof include[key] !== 'boolean')) ? include[key] : utils_1.default.undefined, (exclude && (typeof exclude[key] !== 'boolean')) ? exclude[key] : utils_1.default.undefined);
            }
            if (!utils_1.default.isUndefined(value)) {
                object[key] = value;
            }
        }
    };
    /**
     * To string
     */
    Model.prototype.toString = function () {
        return this.toJSON();
    };
    /**
     * The Collection
     */
    Model.Collection = 'Collection';
    /**
     * The schema
     */
    Model.schema = {};
    /**
     * Is Model
     */
    Model.isModel = true;
    return Model;
}());
exports.default = Model;
