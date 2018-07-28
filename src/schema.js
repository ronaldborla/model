"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("./model");
var utils_1 = require("./utils");
/**
 * Schema
 */
var Schema = /** @class */ (function () {
    function Schema(modeljs, model) {
        var _this = this;
        /**
         * Schema keys
         */
        this.keys = [];
        /**
         * Cache
         */
        this.cache = {
            index: {
                keys: {}
            },
            mutators: {
                get: {},
                set: {}
            }
        };
        var constructors = [], schema = {};
        this.modeljs = modeljs;
        this.Model = model;
        if (utils_1.default.isUndefined(this.modeljs.types[this.Model.Collection])) {
            throw new this.modeljs.Exception('Collection `' + this.Model.Collection + '` is not registered');
        }
        this.Model.Collection = this.modeljs.types[this.Model.Collection];
        this.Model.Collection.Model = this.Model;
        while (model && (model !== model_1.default)) {
            constructors.push(model);
            model = utils_1.default.getParent(model);
        }
        for (var i = constructors.length - 1; i >= 0; i--) {
            utils_1.default.extend(schema, constructors[i].schema);
        }
        var index = 0;
        utils_1.default.forEach(schema, function (value, name) {
            var key = new _this.modeljs.Key(_this, name, value);
            _this.cache.index.keys[name] = index++;
            _this.keys.push(key);
        });
    }
    return Schema;
}());
exports.default = Schema;
