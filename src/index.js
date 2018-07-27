"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var collection_1 = require("./collection");
exports.Collection = collection_1.default;
var exception_1 = require("./exception");
exports.Exception = exception_1.default;
var key_1 = require("./key");
exports.Key = key_1.default;
var model_1 = require("./model");
exports.Model = model_1.default;
var schema_1 = require("./schema");
exports.Schema = schema_1.default;
var type_1 = require("./type");
exports.Type = type_1.default;
var utils_1 = require("./utils");
exports.Utils = utils_1.Utils;
var utils_2 = require("./utils");
exports.utils = utils_2.default;
/**
 * Model JS
 */
var ModelJS = /** @class */ (function () {
    function ModelJS() {
        /**
         * Exception to use
         */
        this.Exception = exception_1.default;
        /**
         * Key to use
         */
        this.Key = key_1.default;
        /**
         * Schema to use
         */
        this.Schema = schema_1.default;
        /**
         * Type to use
         */
        this.Type = type_1.default;
        /**
         * All types
         */
        this.types = {};
        /**
         * All schemas
         */
        this.schemas = [];
    }
    /**
     * Boot Model JS
     */
    ModelJS.prototype.boot = function () {
        var _this = this;
        Object.keys(this.types).forEach(function (key) {
            if (_this.types[key].isModel === true) {
                _this.schemas.push(new _this.Schema(_this, _this.types[key]));
            }
        });
        this.schemas.forEach(function (schema) {
            schema.Model.schema = schema;
        });
        return this;
    };
    /**
     * Get all collections
     */
    ModelJS.prototype.getCollections = function () {
        var _this = this;
        return Object.keys(this.types).filter(function (key) {
            return _this.types[key].isCollection === true;
        }).map(function (key) {
            return _this.types[key];
        });
    };
    /**
     * Get all models
     */
    ModelJS.prototype.getModels = function () {
        var _this = this;
        return Object.keys(this.types).filter(function (key) {
            return _this.types[key].isModel === true;
        }).map(function (key) {
            return _this.types[key];
        });
    };
    /**
     * Register types
     */
    ModelJS.prototype.register = function (types) {
        var _this = this;
        if (!utils_2.default.isArray(types)) {
            types = [types];
        }
        types.forEach(function (type) {
            _this.types[type.name] = type;
        });
        return this;
    };
    return ModelJS;
}());
exports.ModelJS = ModelJS;
