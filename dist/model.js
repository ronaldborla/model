(function (exports) {
'use strict';

var Collection = (function () {
    function Collection() {
        _this = _super.call(this) || this;
    }
    return Collection;
}());

var Type = (function () {
    function Type(name, constructor) {
        this.$constructor = null;
        this.name = null;
        this.safe = null;
        this.name = name + '';
        this.safe = this.name.toLowerCase();
        this.$constructor = constructor;
    }
    Type.prototype.convert = function (variable) {
        if (!this.is(variable)) {
            variable = new this.$constructor(variable);
        }
        return variable;
    };
    Type.prototype.is = function (variable) {
        return ((typeof variable).toLowerCase() === this.safe) || (variable instanceof this.$constructor);
    };
    Type.prototype.match = function (constructor) {
        return constructor === this.$constructor;
    };
    return Type;
}());

var Key = (function () {
    function Key(schema, name, key) {
        this.default = null;
        this.name = null;
        this.schema = null;
        this.type = null;
        this.booted = false;
        this.schema = schema;
        this.name = name;
        this.default = key.default || null;
        this.type = key.type || key;
    }
    Key.prototype.boot = function () {
        if (this.booted) {
            return this;
        }
        var key = this, name = this.name, utils = this.schema.utils;
        if (!(this.type instanceof Type)) {
            this.type = this.schema.model.type(this.type);
        }
        Object.defineProperty(this.schema.$constructor.prototype, name, {
            get: function () {
                var value = this.$attributes[name], mutator = this.constructor.$cache.mutators.get[name];
                if (utils.isUndefined(mutator)) {
                    var fn = utils.camelCase(['get', name, 'attribute'].join(' '));
                    mutator =
                        this.constructor.$cache.mutators.get[name] =
                            utils.isFunction(this[fn]) ? fn : null;
                }
                if (mutator !== null) {
                    value = this[mutator].apply(this, [value]);
                }
                return value;
            },
            set: function (value) {
                var prev = this.$attributes[name];
                value = key.evaluate(value, this);
                this.$attributes[name] = value;
                return this;
            }
        });
        this.booted = true;
        return this;
    };
    Key.prototype.evaluate = function (value, model) {
        value = this.type.convert(value);
        return value;
    };
    Key.Type = Type;
    return Key;
}());

var Schema = (function () {
    function Schema(keys) {
        var _this = this;
        this.keys = [];
        this.methods = {};
        this.statics = {};
        this.virtuals = {};
        this.booted = false;
        var index = 0;
        this.keys.$index = {};
        this.utils.forEach(keys, function (key, name) {
            var key_instance = new Key(_this, name, key);
            _this.keys.$index[key_instance.name] = index++;
            _this.keys.push(key_instance);
        });
    }
    Object.defineProperty(Schema.prototype, "model", {
        get: function () {
            return this.constructor.model;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "utils", {
        get: function () {
            return this.model.utils;
        },
        enumerable: true,
        configurable: true
    });
    Schema.prototype.boot = function () {
        if (this.booted) {
            return this;
        }
        var utils = this.utils;
        if (this.$constructor.inherits) {
            var inherits = this.$constructor.inherits;
            if (!utils.isUndefined(inherits) && !utils.isFunction(inherits)) {
                this.$constructor.inherits = this.model.schemas[inherits].boot().$constructor;
            }
            utils.inherit(this.$constructor.inherits, this.$constructor);
        }
        this.extend(this, function (constructor) {
            this.boot = boot;
            this.load = load;
            function boot() {
                this.constructor.$cache = {
                    mutators: {
                        get: {},
                        set: {}
                    }
                };
                this.$attributes = {};
                this.$listeners = {};
            }
            function load(data) {
                var _this = this;
                utils.forEach(data || {}, function (value, key) {
                    _this[key] = value;
                });
                return this;
            }
        });
        this.booted = true;
        return this;
    };
    Schema.prototype.define = function (constructor) {
        constructor.isModel = true;
        this.$constructor = constructor;
        return constructor.schema = this;
    };
    Schema.prototype.extend = function (schema, define) {
        var _this = this;
        this.utils.forEach(schema.methods, function (value, key, object) {
            schema.$constructor.prototype[key] = value;
        });
        this.utils.forEach(schema.statics, function (value, key, object) {
            schema.$constructor[key] = value;
        });
        this.utils.forEach(schema.virtuals, function (virtual, key) {
            var definition = {};
            if (_this.utils.isFunction(virtual)) {
                definition.get = virtual;
            }
            else {
                if (!virtual) {
                    virtual = {};
                }
                if (_this.utils.isFunction(virtual.get)) {
                    definition.get = virtual.get;
                }
                if (_this.utils.isFunction(virtual.set)) {
                    definition.set = virtual.set;
                }
            }
            if (_this.utils.isFunction(definition.get) || _this.utils.isFunction(definition.set)) {
                Object.defineProperty(schema.$constructor.prototype, key, definition);
            }
        });
        if (!this.utils.isUndefined(define)) {
            define.apply(schema.$constructor.prototype, [schema.$constructor]);
        }
        return this;
    };
    Schema.prototype.inherit = function (model) {
        this.$constructor.inherits = model;
        return this;
    };
    Schema.prototype.getKey = function (name) {
        return this.keys[this.keys.$index[name]];
    };
    Schema.prototype.method = function (name, callback) {
        this.methods[name] = callback;
        return this;
    };
    Schema.prototype.static = function (name, callback) {
        this.statics[name] = callback;
        return this;
    };
    Schema.prototype.super = function (model, name, args) {
        if (name === 'constructor') {
            return this.$constructor.inherits.apply(model, args || []);
        }
        else {
            return this.$constructor.inherits.prototype[name].apply(model, args || []);
        }
    };
    Schema.prototype.virtual = function (method, name, callback) {
        if (this.utils.isUndefined(this.virtuals[name])) {
            this.virtuals[name] = {};
        }
        else if (this.utils.isFunction(this.virtuals[name])) {
            this.virtuals[name] = {
                get: this.virtuals[name]
            };
        }
        this.virtuals[name][method] = callback;
        return this;
    };
    Schema.Key = Key;
    return Schema;
}());

var Utils = (function () {
    function Utils() {
        this.undefined = (function (undefined) {
            return undefined;
        })();
    }
    Utils.prototype.camelCase = function (str) {
        return str.replace(/[-_]+/g, ' ').replace(/(?:^\w|[A-Z]|\b\w|[\s-_]+)/g, function (match, index) {
            if (+match === 0) {
                return '';
            }
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    };
    Utils.prototype.extend = function (left, right) {
        this.forEach(right, function (value, name) {
            left[name] = value;
        });
        return left;
    };
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
    Utils.prototype.inherit = function (parent, child) {
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        this.extend(child, parent);
        return child;
    };
    Utils.prototype.isFunction = function (variable) {
        return !!(variable && variable.constructor && variable.call && variable.apply);
    };
    Utils.prototype.isUndefined = function (variable) {
        return variable === this.undefined;
    };
    return Utils;
}());

var Model = (function () {
    function Model() {
        var _this = this;
        this.Collection = Collection;
        this.Model = Model;
        this.Schema = Schema;
        this.Types = {};
        this.utils = new Utils();
        this.booted = false;
        this.models = {};
        this.schemas = {};
        this.Collection.model
            = this.Schema.model
                = this.utils.model
                    = this;
        this.Types.$keys = [];
        this.Types.$length = 0;
        this.schemas.$keys = [];
        ['Array', 'Boolean', 'Date', 'Number', 'Object', 'String'].forEach(function (type) {
            _this.type(type, window[type]);
        });
    }
    Model.prototype.boot = function () {
        var _this = this;
        if (this.booted) {
            return this;
        }
        this.schemas.$keys.forEach(function (name) {
            _this.models[name] = _this.schemas[name].boot().$constructor;
            _this.type(name, _this.models[name]);
        });
        this.schemas.$keys.forEach(function (name) {
            _this.schemas[name].keys.forEach(function (key) {
                key.boot();
            });
        });
        this.booted = true;
        return this;
    };
    Model.prototype.model = function (name, schema, constructor) {
        if (this.utils.isUndefined(schema)) {
            if (!this.booted) {
                throw new Error('ModelJS must be booted first');
            }
            return this.models[name];
        }
        else {
            constructor.$name = name;
            this.schemas[name] = schema.define(constructor);
            this.schemas.$keys.push(name);
            return this.schemas[name];
        }
    };
    Model.prototype.type = function (name, constructor) {
        if (this.utils.isUndefined(constructor)) {
            if (this.utils.isFunction(name)) {
                for (var i = 0; i < this.Types.$length; i++) {
                    var type = this.Types[this.Types.$keys[i]];
                    if (type.match(name)) {
                        return type;
                    }
                }
            }
            if (this.utils.isUndefined(this.Types[name])) {
                throw new Error('Type `' + name + '` does not exist');
            }
            return this.Types[name];
        }
        else {
            if (!this.utils.isUndefined(this.Types[name])) {
                throw new Error('Type `' + name + '` already exists');
            }
            this.Types[name] = new Type(name, constructor);
            this.Types.$keys.push(name);
            this.Types.$length++;
            return this;
        }
    };
    return Model;
}());

var ModelJS = new Model();

exports.ModelJS = ModelJS;

}((this.window = this.window || {})));
//# sourceMappingURL=model.js.map
