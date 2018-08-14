"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var collection_1 = require("./collection");
var model_1 = require("./model");
var utils_1 = require("./utils");
/**
 * Key
 */
var Key = /** @class */ (function () {
    function Key(schema, name, object) {
        var key = this;
        this.default = object.default;
        this.hidden = (object.hidden === true);
        this.name = name;
        this.options = object.options;
        this.schema = schema;
        var type = object.type || object;
        if (utils_1.default.isString(type)) {
            type = this.schema.modeljs.types[type];
        }
        if (utils_1.default.isUndefined(type)) {
            throw new this.schema.modeljs.Exception('Type for key `' + name + '` is not registered');
        }
        this.type = new this.schema.modeljs.Type(this, type);
        Object.defineProperty(this.schema.Model.prototype, this.name, {
            enumerable: true,
            get: function getAttribute() {
                return callMutator.apply(this, ['get', this.__.attributes[key.name]]);
            },
            set: function setAttribute(value) {
                this.__.attributes[key.name] = callMutator.apply(this, ['set',
                    setParent(key.cast(this, value), this),
                    this.__.attributes[key.name]
                ]);
            }
        });
        /**
         * Call mutator
         */
        function callMutator(method, value, previous) {
            var mutator = key.schema.cache.mutators[method][key.name];
            if (utils_1.default.isUndefined(mutator)) {
                var fn = utils_1.default.camelCase([method, name, 'attribute'].join(' '));
                mutator =
                    key.schema.cache.mutators[method][name] =
                        utils_1.default.isFunction(this[fn]) ? fn : null;
            }
            if (mutator !== null) {
                value = this[mutator].apply(this, [value, previous]);
            }
            return value;
        }
        /**
         * Set Model or Collection parent
         */
        function setParent(value, parent) {
            if (value && ((value instanceof model_1.default) || (value instanceof collection_1.default))) {
                value.__.parent = parent;
            }
            return value;
        }
    }
    /**
     * Cast
     */
    Key.prototype.cast = function (model, value) {
        var options = utils_1.default.isUndefined(this.options) ? utils_1.default.undefined : utils_1.default.extend({}, this.options);
        if (!utils_1.default.isUndefined(options)) {
            options.key = this;
            options.parent = model;
        }
        return this.type.cast(value, options);
    };
    return Key;
}());
exports.default = Key;
