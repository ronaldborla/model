(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.window = global.window || {})));
}(this, (function (exports) { 'use strict';

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __ = '__private__';

/**
 * Model utilities
 */
var Utils = /** @class */ (function () {
    /**
     * The constructor
     */
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
                return ''; // or if (/\s+/.test(match)) for white spaces
            }
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    };
    /**
     * Emit an event
     */
    Utils.prototype.emit = function () {
        var utils = this;
        return function (name, args, source) {
            if (utils.isUndefined(source)) {
                source = this;
            }
            this.fire(name, args, source);
            if (!utils.isUndefined(this[__].parent) && utils.isFunction(this[__].parent.emit)) {
                this[__].parent.emit(name, args, source);
            }
            if (!utils.isUndefined(this[__].collection) && utils.isFunction(this[__].collection.emit)) {
                this[__].collection.emit(name, args, source);
            }
            return this;
        };
    };
    /**
     * Extend
     */
    Utils.prototype.extend = function (left, right, ignore) {
        var _this = this;
        this.forEach(right, function (value, name) {
            if (_this.isUndefined(ignore) || ignore.indexOf(name) < 0) {
                left[name] = value;
            }
        });
        return left;
    };
    /**
     * Fire an event
     */
    Utils.prototype.fire = function () {
        var utils = this;
        return function (name, args, source) {
            var _this = this;
            if (!utils.isUndefined((this[__].listeners || {})[name])) {
                if (!utils.isUndefined(source)) {
                    args = (args || []).slice();
                    args.push(source);
                }
                (this[__].listeners[name] || []).forEach(function (callback) {
                    callback.apply(_this, args || []);
                });
            }
            return this;
        };
    };
    /**
     * Flatten ignore
     */
    Utils.prototype.flattenIgnore = function (ignore) {
        var _this = this;
        var flattened = {
            __flattened: true
        };
        if (!this.isUndefined(ignore)) {
            var child_keys_1 = [];
            (ignore || []).forEach(function (attribute) {
                var pos = attribute.indexOf('.'), left = (pos >= 0) ? attribute.substr(0, pos) : attribute, right = (pos >= 0) ? attribute.substr(pos + 1) : '';
                if (right) {
                    if (_this.isUndefined(flattened[left])) {
                        flattened[left] = [];
                    }
                    if (flattened[left] !== true) {
                        if (child_keys_1.indexOf(left) < 0) {
                            child_keys_1.push(left);
                        }
                        flattened[left].push(right);
                    }
                }
                else {
                    flattened[left] = true;
                }
            });
            child_keys_1.forEach(function (key) {
                if (flattened[key] !== true) {
                    flattened[key] = _this.flattenIgnore(flattened[key]);
                }
            });
        }
        return flattened;
    };
    /**
     * Foreach
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
     * Inherit a protoype
     */
    Utils.prototype.inherit = function (parent, child, ignore) {
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        this.extend(child, parent, ignore);
        return child;
    };
    /**
     * Is function
     */
    Utils.prototype.isFunction = function (variable) {
        return !!(variable && variable.constructor && variable.call && variable.apply);
    };
    /**
     * Is undefined
     */
    Utils.prototype.isUndefined = function (variable) {
        return variable === this.undefined;
    };
    /**
     * Listen to an event
     */
    Utils.prototype.on = function () {
        var utils = this;
        return function (name, callback) {
            var object = this;
            if (!utils.isFunction(callback)) {
                throw new Error('Callback parameter must be a function');
            }
            if (utils.isUndefined(this[__].listeners)) {
                this[__].listeners = {};
            }
            if (utils.isUndefined(this[__].listeners[name])) {
                this[__].listeners[name] = [];
                this[__].listeners[name].__index = 0;
            }
            var id = callback.id = this[__].listeners[name].__index++;
            this[__].listeners[name].push(callback);
            return function () {
                var index = -1, length = object[__].listeners[name].length;
                for (var i = 0; i < length; i++) {
                    if (object[__].listeners[name][i].id === id) {
                        index = i;
                        break;
                    }
                }
                if (index >= 0) {
                    object[__].listeners[name].splice(index, 1);
                }
                return object;
            };
        };
    };
    return Utils;
}());
/**
 * Export instance
 */
var utils = new Utils();

/**
 * The Model
 */
var Model = /** @class */ (function () {
    /**
     * The Model constructor
     */
    function Model() {
        this[__] = {
            attributes: {},
            listeners: {}
        };
        this.constructor.schema.applyDefaults(this);
    }
    /**
     * Emit an event
     */
    Model.prototype.emit = function (name, args, source) {
        return utils.emit().apply(this, [name, args, source]);
    };
    /**
     * Fire an event
     */
    Model.prototype.fire = function (name, args, source) {
        return utils.fire().apply(this, [name, args, source]);
    };
    /**
     * Load attributes
     */
    Model.prototype.load = function (data) {
        var _this = this;
        utils.forEach(data || {}, function (value, key) {
            if (_this.constructor.schema.hasKey(key) || _this.constructor.schema.hasVirtual(key, 'set')) {
                _this[key] = value;
            }
        });
        return this.fire('load');
    };
    /**
     * Listen to an event
     */
    Model.prototype.on = function (name, callback) {
        return utils.on().apply(this, [name, callback]);
    };
    /**
     * To string
     */
    Model.prototype.toJSON = function (ignore, replacer, space) {
        return JSON.stringify(this.toObject(ignore), replacer, space);
    };
    /**
     * Convert to object
     */
    Model.prototype.toObject = function (ignore) {
        var _this = this;
        var object = {}, schema = this.constructor.schema;
        if (!ignore || !ignore.__flattened) {
            ignore = utils.flattenIgnore(ignore);
        }
        schema.all_keys.forEach(function (key) {
            if (ignore[key.name] !== true) {
                var value = _this[key.name];
                if (value && utils.isFunction(value.toObject)) {
                    value = value.toObject(ignore[key.name]);
                }
                if (!utils.isUndefined(value)) {
                    object[key.name] = value;
                }
            }
        });
        if ((schema.options.toObject || {}).virtuals === true) {
            schema.virtuals.__keys.forEach(function (key_name) {
                if (ignore[key_name] !== true && (utils.isFunction(schema.virtuals[key_name].get) || utils.isFunction(schema.virtuals[key_name]))) {
                    var value = _this[key_name];
                    if (value && utils.isFunction(value.toObject)) {
                        value = value.toObject(ignore[key_name]);
                    }
                    if (!utils.isUndefined(value)) {
                        object[key_name] = value;
                    }
                }
            });
        }
        return object;
    };
    /**
     * To string
     */
    Model.prototype.toString = function () {
        return this.toJSON();
    };
    return Model;
}());

/**
 * Model Collection
 */
var Collection = /** @class */ (function (_super) {
    __extends(Collection, _super);
    /**
     * The Collection constructor
     */
    function Collection() {
        var _this = this;
        _this[__] = {
            attributes: {},
            listeners: {}
        };
        _this.constructor.schema.applyDefaults(_this);
        return _this;
    }
    /**
     * Cast a variable into this collection's constructor
     */
    Collection.prototype.cast = function (variable) {
        var item = this.type.cast(variable);
        if (item instanceof Model) {
            item[__].collection = this;
        }
        return item;
    };
    Object.defineProperty(Collection.prototype, "model", {
        /**
         * Collection model
         */
        get: function () {
            return utils.model.models[this.constructor.__constructor] || Model;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Collection.prototype, "type", {
        /**
         * Type
         */
        get: function () {
            return utils.model.types[this.constructor.__constructor || 'Model'];
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Concatenate arrays
     */
    Collection.prototype.concat = function () {
        for (var i = 0; i < arguments.length; i++) {
            this.push.apply(this, arguments[i]);
        }
        return this;
    };
    /**
     * Emit an event
     */
    Collection.prototype.emit = function (name, args, source) {
        return utils.emit().apply(this, [name, args, source]);
    };
    /**
     * Override fill
     */
    Collection.prototype.fill = function () {
        arguments[0] = this.cast(arguments[0]);
        return Array.prototype.fill.apply(this, arguments);
    };
    /**
     * Fire an event
     */
    Collection.prototype.fire = function (name, args, source) {
        return utils.fire().apply(this, [name, args, source]);
    };
    /**
     * Load
     */
    Collection.prototype.load = function (items) {
        this.push.apply(this, items || []);
        return this.fire('load');
    };
    /**
     * Listen to an event
     */
    Collection.prototype.on = function (name, callback) {
        return utils.on().apply(this, [name, callback]);
    };
    /**
     * Override push
     */
    Collection.prototype.push = function () {
        for (var i = 0; i < arguments.length; i++) {
            arguments[i] = this.cast(arguments[i]);
        }
        return Array.prototype.push.apply(this, arguments);
    };
    /**
     * Override splice
     */
    Collection.prototype.splice = function () {
        if (arguments.length > 2) {
            for (var i = 2; i < arguments.length; i++) {
                arguments[i] = this.cast(arguments[i]);
            }
        }
        return Array.prototype.splice.apply(this, arguments);
    };
    /**
     * Convert to JSON
     */
    Collection.prototype.toJSON = function (ignore, replacer, space) {
        return JSON.stringify(this.toObject(ignore), replacer, space);
    };
    /**
     * Convert to object
     */
    Collection.prototype.toObject = function (ignore) {
        if (!ignore || !ignore.__flattened) {
            ignore = utils.flattenIgnore(ignore);
        }
        return this.map(function (item) {
            return utils.isFunction(item.toObject) ? item.toObject(ignore) : item;
        });
    };
    /**
     * To string
     */
    Collection.prototype.toString = function () {
        return this.toJSON();
    };
    /**
     * Override unshift
     */
    Collection.prototype.unshift = function () {
        for (var i = 0; i < arguments.length; i++) {
            arguments[i] = this.cast(arguments[i]);
        }
        return Array.prototype.unshift.apply(this, arguments);
    };
    return Collection;
}(Array));

/**
 * Key Type
 */
var Type = /** @class */ (function () {
    /**
     * Type constructor
     */
    function Type(name, constructor) {
        /**
         * The name
         */
        this.name = null;
        /**
         * Safe name
         */
        this.safe = null;
        /**
         * The constructor
         */
        this.__constructor = null;
        this.name = name + '';
        this.safe = this.name.toLowerCase();
        this.__constructor = constructor;
    }
    /**
     * Cast a variable into this type
     */
    Type.prototype.cast = function (variable, options) {
        if (!this.is(variable)) {
            variable = new this.__constructor(variable, options);
        }
        return variable;
    };
    /**
     * Compare
     */
    Type.prototype.compare = function (a, b) {
        if (a > b) {
            return 1;
        }
        else if (b > a) {
            return -1;
        }
        else {
            return 0;
        }
    };
    /**
     * Check if variable is an instance of this type
     */
    Type.prototype.is = function (variable) {
        return ((typeof variable).toLowerCase() === this.safe) || (variable && (variable instanceof this.__constructor));
    };
    /**
     * Check if constructor matches
     */
    Type.prototype.match = function (constructor) {
        return constructor === this.__constructor;
    };
    return Type;
}());

/**
 * Model Key class
 */
var Key = /** @class */ (function () {
    /**
     * Key constructor
     */
    function Key(schema, name, key) {
        /**
         * Default value
         */
        this["default"] = utils.undefined;
        /**
         * Key name
         */
        this.name = null;
        /**
         * Key options
         */
        this.options = utils.undefined;
        /**
         * The schema
         */
        this.schema = null;
        /**
         * The type
         */
        this.type = null;
        /**
         * Booted
         */
        this.booted = false;
        this.schema = schema;
        this.name = name;
        this["default"] = key["default"];
        this.options = key.options;
        this.type = key.type || key;
    }
    /**
     * Boot key
     */
    Key.prototype.boot = function () {
        if (this.booted) {
            return this;
        }
        var key = this, name = this.name, schema = this.schema;
        // Fix type
        if (!(this.type instanceof Type)) {
            this.type = schema.model.type(this.type);
        }
        // Define attribute
        Object.defineProperty(schema.__constructor.prototype, name, {
            get: function () {
                return callMutator.apply(this, ['get', this[__].attributes[name]]);
            },
            set: function (value) {
                var previous = this[__].attributes[name];
                value = setParent(key.type.cast(value, key.options), this);
                this[__].attributes[name] = value = callMutator.apply(this, ['set', value]);
                return this.fire('setAttribute', [name, value, previous]);
            }
        });
        this.booted = true;
        return this;
        /**
         * Call mutator
         */
        function callMutator(method, value) {
            var mutator = schema.cache.mutators[method][name];
            if (utils.isUndefined(mutator)) {
                var fn = utils.camelCase([method, name, 'attribute'].join(' '));
                mutator =
                    schema.cache.mutators[method][name] =
                        utils.isFunction(this[fn]) ? fn : null;
            }
            if (mutator !== null) {
                value = this[mutator].apply(this, [value]);
            }
            return value;
        }
        /**
         * Set Model or Collection parent
         */
        function setParent(value, model) {
            if (value && ((value instanceof Model) || (value instanceof Collection))) {
                value[__].parent = model;
            }
            return value;
        }
    };
    /**
     * Type
     */
    Key.Type = Type;
    return Key;
}());

/**
 * The Model Schema class
 */
var Schema = /** @class */ (function () {
    /**
     * Schema constructor
     */
    function Schema(constructor, keys, options) {
        var _this = this;
        /**
         * The keys
         */
        this.keys = [];
        /**
         * Methods
         */
        this.methods = {};
        /**
         * Statics
         */
        this.statics = {};
        /**
         * Virtuals
         */
        this.virtuals = {};
        /**
         * Booted up
         */
        this.booted = false;
        /**
         * Model
         */
        this.model = null;
        /**
         * Options
         */
        this.options = {};
        /**
         * Schema type
         */
        this.type = 'model';
        /**
         * Cache
         */
        this.cache = {
            mutators: {
                get: {},
                set: {}
            }
        };
        constructor.schema = this;
        this.__constructor = constructor;
        this.options = options || {};
        if (!utils.isUndefined(keys) && keys) {
            var index_1 = 0;
            this.keys.__index = {};
            utils.forEach(keys, function (key, name) {
                var key_instance = new Key(_this, name, key);
                _this.keys.__index[key_instance.name] = index_1++;
                _this.keys.push(key_instance);
            });
        }
    }
    Object.defineProperty(Schema.prototype, "all_keys", {
        /**
         * All keys
         */
        get: function () {
            var _this = this;
            if (!utils.isUndefined(this.__keys)) {
                return this.__keys;
            }
            this.__keys = [].concat(this.inherited_keys, this.keys);
            this.__keys.__index = {};
            this.__keys.forEach(function (key, i) {
                _this.__keys.__index[key.name] = i;
            });
            return this.__keys;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "base_constructor", {
        /**
         * Base constructor
         */
        get: function () {
            switch (this.type) {
                case 'collection':
                    return Collection;
                case 'model':
                    return Model;
            }
            return utils.undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "constructors", {
        /**
         * Constructors
         */
        get: function () {
            return this.model.schemas[this.type + 's'];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "inherited_keys", {
        /**
         * Inherited keys
         */
        get: function () {
            var schema = (this.__constructor.inherits || {}).schema || {}, parent_keys = schema.keys || [], keys = [];
            (schema.inherited_keys || []).forEach(function (key) {
                if (utils.isUndefined(parent_keys.__index[key.name])) {
                    keys.push(key);
                }
            });
            return keys.concat(parent_keys);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Apply defaults
     */
    Schema.prototype.applyDefaults = function (object) {
        this.all_keys.forEach(function (key) {
            if (!utils.isUndefined(key["default"])) {
                object[key.name] = key["default"];
            }
        });
        return object;
    };
    /**
     * Boot schema
     */
    Schema.prototype.boot = function () {
        var _this = this;
        if (this.booted) {
            return this;
        }
        if (utils.isUndefined(this.__constructor.inherits)) {
            this.__constructor.inherits = this.base_constructor;
            if (utils.isUndefined(this.__constructor.inherits)) {
                throw new Error('Invalid schema type: ' + this.type);
            }
        }
        if (!utils.isFunction(this.__constructor.inherits)) {
            var parent = this.constructors[this.__constructor.inherits];
            if (utils.isUndefined(parent)) {
                throw new Error('Invalid schema type: ' + this.type);
            }
            this.__constructor.inherits = (parent instanceof Schema) ? parent.boot().__constructor : parent;
        }
        utils.inherit(this.__constructor.inherits, this.__constructor, [
            '__constructor',
            '__name',
            'inherits',
            'schema'
        ]);
        // Define properties
        utils.forEach(this.methods, function (value, key, object) {
            if (utils.isFunction(value)) {
                _this.__constructor.prototype[key] = value;
            }
        });
        utils.forEach(this.statics, function (value, key, object) {
            _this.__constructor[key] = value;
        });
        this.virtuals.__keys = [];
        utils.forEach(this.virtuals, function (virtual, key) {
            var definition = {};
            if (utils.isFunction(virtual)) {
                definition.get = virtual;
            }
            else {
                if (!virtual) {
                    virtual = {};
                }
                if (utils.isFunction(virtual.get)) {
                    definition.get = virtual.get;
                }
                if (utils.isFunction(virtual.set)) {
                    definition.set = virtual.set;
                }
            }
            if (utils.isFunction(definition.get) || utils.isFunction(definition.set)) {
                Object.defineProperty(_this.__constructor.prototype, key, definition);
            }
            _this.virtuals.__keys.push(key);
        });
        this.booted = true;
        return this;
    };
    /**
     * Define a model
     */
    Schema.prototype.define = function (modeljs, name, type, model) {
        this.__constructor.__name = name;
        this.model = modeljs;
        if (!utils.isUndefined(type)) {
            this.type = type;
        }
        if (this.type === 'collection') {
            this.__constructor.__constructor = model || 'Model';
        }
        return this;
    };
    /**
     * Has key
     */
    Schema.prototype.hasKey = function (name) {
        return !utils.isUndefined(this.getKey(name));
    };
    /**
     * Has virtual
     */
    Schema.prototype.hasVirtual = function (name, method) {
        if (method === void 0) { method = 'get'; }
        if (method === 'get') {
            return utils.isFunction(this.virtuals[name]) || utils.isFunction(this.virtuals[name].get);
        }
        else if (method === 'set') {
            return !utils.isUndefined(this.virtuals[name]) && utils.isFunction(this.virtuals[name].set);
        }
        else {
            return false;
        }
    };
    /**
     * Inherit a parent constructor
     */
    Schema.prototype.inherit = function (parent) {
        this.__constructor.inherits = parent;
        return this;
    };
    /**
     * Get key
     */
    Schema.prototype.getKey = function (name) {
        return this.all_keys[this.all_keys.__index[name]];
    };
    /**
     * Setup a method
     */
    Schema.prototype.method = function (name, callback) {
        this.methods[name] = callback;
        return this;
    };
    /**
     * Setup a static method
     */
    Schema.prototype.static = function (name, callback) {
        this.statics[name] = callback;
        return this;
    };
    /**
     * Call super method
     */
    Schema.prototype["super"] = function (object, name, args) {
        if (name === 'constructor') {
            return this.__constructor.inherits.apply(object, args || []);
        }
        else {
            return this.__constructor.inherits.prototype[name].apply(object, args || []);
        }
    };
    /**
     * Setup a virtual method
     */
    Schema.prototype.virtual = function (name, callback, method) {
        if (method === void 0) { method = 'get'; }
        if (method !== 'get' && method !== 'set') {
            throw new Error('Invalid virtual method: ' + method);
        }
        if (utils.isUndefined(this.virtuals[name])) {
            this.virtuals[name] = {};
        }
        else if (utils.isFunction(this.virtuals[name])) {
            this.virtuals[name] = {
                get: this.virtuals[name]
            };
        }
        this.virtuals[name][method] = callback;
        return this;
    };
    /**
     * The Key
     */
    Schema.Key = Key;
    return Schema;
}());

/**
 * The ModelJS class
 */
var ModelJS = /** @class */ (function () {
    /**
     * Model constructor
     */
    function ModelJS() {
        /**
         * The Collection
         */
        this.Collection = Collection;
        /**
         * The Model
         */
        this.Model = Model;
        /**
         * Set Schema so that it can be accessible by modeljs.Schema
         */
        this.Schema = Schema;
        /**
         * Types
         */
        this.types = {};
        /**
         * The utilities
         */
        this.utils = utils;
        /**
         * Booted
         */
        this.booted = false;
        /**
         * Collections
         */
        this.collections = {};
        /**
         * Models
         */
        this.models = {};
        /**
         * Schemas
         */
        this.schemas = {
            collections: {},
            models: {}
        };
        utils.model = this;
        this.schemas.collections.__keys = [];
        this.schemas.models.__keys = [];
        this.types.__keys = [];
        this.types.__length = 0;
        // Initial types are Javascript Native types
        this.type('Array', Array);
        this.type('Boolean', Boolean);
        this.type('Date', Date);
        this.type('Number', Number);
        this.type('Object', Object);
        this.type('String', String);
        // Set Collection and Model
        this.type('Model', Model);
        this.type('Collection', Collection);
    }
    /**
     * Register
     */
    ModelJS.prototype.register = function (type, name, schema, inherit, model) {
        var plural = type + 's';
        if (utils.isUndefined(schema)) {
            if (!this.booted) {
                throw new Error('modeljs must be booted first');
            }
            return this[plural][name];
        }
        else {
            if (!(schema instanceof Schema)) {
                throw new Error('schema must be an instance of `Schema`');
            }
            this.schemas[plural][name] = schema.define(this, name, type, model);
            this.schemas[plural].__keys.push(name);
            if (!utils.isUndefined(inherit)) {
                this.schemas[plural][name].inherit(inherit);
            }
            return this.schemas[plural][name];
        }
    };
    /**
     * Boot up
     * Models need to be booted up so that the dependencies within schemas can be properly handled
     */
    ModelJS.prototype.boot = function () {
        var _this = this;
        if (this.booted) {
            return this;
        }
        // Boot models
        this.schemas.models.__keys.forEach(function (name) {
            if (!utils.isUndefined(_this.models[name])) {
                throw new Error('Model already exists: ' + name);
            }
            _this.models[name] = _this.schemas.models[name].boot().__constructor;
            _this.type(name, _this.models[name]);
        });
        // Boot keys
        this.schemas.models.__keys.forEach(function (name) {
            _this.models[name].schema.keys.forEach(function (key) {
                key.boot();
            });
        });
        // Boot collections
        this.schemas.collections.__keys.forEach(function (name) {
            if (!utils.isUndefined(_this.collections[name])) {
                throw new Error('Collection already exists: ' + name);
            }
            _this.collections[name] = _this.schemas.collections[name].boot().__constructor;
            _this.type(name, _this.collections[name]);
        });
        this.booted = true;
        return this;
    };
    /**
     * Define a collection
     */
    ModelJS.prototype.collection = function (name, schema, model, inherit) {
        return this.register('collection', name, schema, inherit, model);
    };
    /**
     * Register or retrieve a Model
     */
    ModelJS.prototype.model = function (name, schema, inherit) {
        return this.register('model', name, schema, inherit);
    };
    /**
     * Register/retrieve type
     */
    ModelJS.prototype.type = function (name, constructor) {
        if (utils.isUndefined(constructor)) {
            if (utils.isFunction(name)) {
                for (var i = 0; i < this.types.__length; i++) {
                    var type = this.types[this.types.__keys[i]];
                    if (type.match(name)) {
                        return type;
                    }
                }
            }
            if (utils.isUndefined(this.types[name])) {
                throw new Error('Type `' + name + '` does not exist');
            }
            return this.types[name];
        }
        else {
            if (!utils.isUndefined(this.types[name])) {
                throw new Error('Type `' + name + '` already exists');
            }
            this.types[name] = new Type(name, constructor);
            this.types.__keys.push(name);
            this.types.__length++;
            return this;
        }
    };
    return ModelJS;
}());
/**
 * Export instance
 */
var modeljs = new ModelJS();

exports.modeljs = modeljs;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=model.js.map
