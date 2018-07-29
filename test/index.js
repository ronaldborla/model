(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

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
        var parent = Object.getPrototypeOf(constructor.prototype);
        if (parent) {
            return parent.constructor;
        }
        return null;
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
var utils = new Utils();

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
        if (!utils.isUndefined(items)) {
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
        include = utils.flatten(include);
    }
    if (exclude && !exclude.__flattened) {
        exclude = utils.flatten(exclude);
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

/**
 * Validator Exception
 */
var Exception = /** @class */ (function (_super) {
    __extends(Exception, _super);
    function Exception() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Exception;
}(Error));

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
            if (data && !utils.isUndefined(data[key.name])) {
                _this[key.name] = data[key.name];
            }
            else if (utils.isFunction(key["default"])) {
                _this[key.name] = key["default"]();
            }
            else if (!utils.isUndefined(key["default"])) {
                _this[key.name] = key["default"];
            }
        });
    }
    /**
     * Load data
     */
    Model.prototype.load = function (data) {
        var _this = this;
        var schema = this.constructor.schema;
        if (!utils.isUndefined(data)) {
            utils.forEach(data, function (value, key) {
                if (!utils.isUndefined(value) && !utils.isUndefined(schema.cache.index.keys[key])) {
                    _this[key] = value;
                }
            });
        }
        return this;
    };
    /**
     * Call parent method
     */
    Model.prototype["super"] = function (method, args) {
        return utils.getParent(this.constructor).prototype[method].apply(this, args || []);
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
            include = utils.flatten(include);
        }
        if (exclude && !exclude.__flattened) {
            exclude = utils.flatten(exclude);
        }
        this.constructor.schema.keys.forEach(function (key) {
            if (key.hidden !== true && key.name !== '__' && (!exclude || exclude[key.name] !== true)) {
                evaluate(key.name, _this[key.name]);
            }
        });
        if (include) {
            utils.forEach(include, function (children, key) {
                evaluate(key, _this[key]);
            });
        }
        return object;
        /**
         * Evaluate
         */
        function evaluate(key, value) {
            if (value && value.constructor && (value.constructor.isModel === true || value.constructor.isCollection === true)) {
                value = value.toObject((include && (typeof include[key] !== 'boolean')) ? include[key] : utils.undefined, (exclude && (typeof exclude[key] !== 'boolean')) ? exclude[key] : utils.undefined);
            }
            if (!utils.isUndefined(value)) {
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

/**
 * Key
 */
var Key = /** @class */ (function () {
    function Key(schema, name, object) {
        var key = this;
        this["default"] = object["default"];
        this.hidden = (object.hidden === true);
        this.name = name;
        this.options = object.options;
        this.schema = schema;
        var type = object.type || object;
        if (utils.isString(type)) {
            type = this.schema.modeljs.types[type];
        }
        if (utils.isUndefined(type)) {
            throw new this.schema.modeljs.Exception('Type for key `' + name + '` is not registered');
        }
        this.type = new this.schema.modeljs.Type(this, type);
        Object.defineProperty(this.schema.Model.prototype, this.name, {
            enumerable: true,
            get: function getAttribute() {
                return callMutator.apply(this, ['get', this.__.attributes[key.name]]);
            },
            set: function setAttribute(value) {
                var previous = this.__.attributes[key.name], options = key.options || utils.undefined;
                if (!utils.isUndefined(options)) {
                    options.parent = this;
                }
                value = setParent(key.type.cast(value, options), this);
                this.__.attributes[key.name] = value = callMutator.apply(this, ['set', value, previous]);
            }
        });
        /**
         * Call mutator
         */
        function callMutator(method, value, previous) {
            var mutator = key.schema.cache.mutators[method][key.name];
            if (utils.isUndefined(mutator)) {
                var fn = utils.camelCase([method, name, 'attribute'].join(' '));
                mutator =
                    key.schema.cache.mutators[method][name] =
                        utils.isFunction(this[fn]) ? fn : null;
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
            if (value && ((value instanceof Model) || (value instanceof Collection))) {
                value.__.parent = parent;
            }
            return value;
        }
    }
    return Key;
}());

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
        if (utils.isUndefined(this.modeljs.types[this.Model.Collection])) {
            throw new this.modeljs.Exception('Collection `' + this.Model.Collection + '` is not registered');
        }
        this.Model.Collection = this.modeljs.types[this.Model.Collection];
        this.Model.Collection.Model = this.Model;
        while (model && (model !== Model)) {
            constructors.push(model);
            model = utils.getParent(model);
        }
        for (var i = constructors.length - 1; i >= 0; i--) {
            utils.extend(schema, constructors[i].schema);
        }
        var index = 0;
        utils.forEach(schema, function (value, name) {
            var key = new _this.modeljs.Key(_this, name, value);
            _this.cache.index.keys[name] = index++;
            _this.keys.push(key);
        });
    }
    return Schema;
}());

/**
 * Type
 */
var Type = /** @class */ (function () {
    function Type(key, Constructor) {
        this.key = key;
        if (!utils.isFunction(Constructor)) {
            throw new this.key.schema.modeljs.Error('Type must be a constructor');
        }
        this.Constructor = Constructor;
        this.hasCompare = utils.isFunction(this.Constructor.prototype.compare);
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
            value = utils.isUndefined(options) ?
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

/**
 * Model JS
 */
var ModelJS = /** @class */ (function () {
    function ModelJS() {
        /**
         * Exception to use
         */
        this.Exception = Exception;
        /**
         * Key to use
         */
        this.Key = Key;
        /**
         * Schema to use
         */
        this.Schema = Schema;
        /**
         * Type to use
         */
        this.Type = Type;
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
        if (!utils.isArray(types)) {
            types = [types];
        }
        types.forEach(function (type) {
            _this.types[type.name] = type;
        });
        return this;
    };
    return ModelJS;
}());

var users$1 = [
    {
        "email": "john.doe@gmail.com",
        "id": "1",
        "profile": {
            "birth_date": "1980-01-01",
            "first_name": "John",
            "id": "1",
            "last_name": "Doe",
            "middle_name": "Dee",
            "sex": "male"
        },
        "username": "john.doe"
    },
    {
        "email": "jane.doe@gmail.com",
        "id": "2",
        "profile": {
            "birth_date": "1981-12-31",
            "first_name": "Jane",
            "id": "2",
            "last_name": "Doe",
            "middle_name": "Day",
            "sex": "female"
        },
        "username": "jane.doe"
    }
];

/**
 * Type Enum
 */
var Enum = /** @class */ (function () {
    function Enum(value, options) {
        this.value = value;
        this.options = options;
    }
    /**
     * Convert to string
     */
    Enum.prototype.toString = function () {
        return this.value + '';
    };
    /**
     * Export
     */
    Enum.prototype["export"] = function () {
        return this + '';
    };
    return Enum;
}());

/**
 * Type Id
 * This is used for primary keys
 */
var Id = /** @class */ (function () {
    function Id(value) {
        this.value = value;
    }
    /**
     * Export
     */
    Id.prototype["export"] = function () {
        return this + '';
    };
    /**
     * Convert to string
     */
    Id.prototype.toString = function () {
        return this.value + '';
    };
    return Id;
}());

/**
 * Type Permalink
 * This automatically generates a permalink
 */
var Permalink = /** @class */ (function () {
    function Permalink(value, options) {
        this.value = value;
        this.options = options;
    }
    /**
     * Cache
     */
    Permalink.cache = {};
    return Permalink;
}());

/**
 * Base Model
 */
var Base = /** @class */ (function (_super) {
    __extends(Base, _super);
    function Base() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Schema
     */
    Base.schema = {
        id: 'Id',
        created: {
            "default": Date.now,
            type: Date
        },
        updated: {
            "default": Date.now,
            type: Date
        }
    };
    return Base;
}(Model));

/**
 * Profile Model
 */
var Profile = /** @class */ (function (_super) {
    __extends(Profile, _super);
    function Profile() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Profile.prototype, "full_name", {
        /**
         * Get full name
         */
        get: function () {
            return [this.first_name, this.last_name].join(' ');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Schema
     */
    Profile.schema = {
        birth_date: Date,
        first_name: String,
        last_name: String,
        middle_name: String,
        sex: {
            "default": 'male',
            options: [
                'male',
                'female'
            ],
            type: 'Enum'
        }
    };
    Profile.Collection = 'Profiles';
    return Profile;
}(Base));

/**
 * Base Collection
 */
var BaseCollection = /** @class */ (function (_super) {
    __extends(BaseCollection, _super);
    function BaseCollection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BaseCollection;
}(Collection));

/**
 * Profiles Collection
 */
var Profiles = /** @class */ (function (_super) {
    __extends(Profiles, _super);
    function Profiles() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Profiles;
}(BaseCollection));

/**
 * User Model
 */
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Schema
     */
    User.schema = {
        email: String,
        profile: 'Profile',
        username: String
    };
    User.Collection = 'Users';
    return User;
}(Base));

/**
 * Users Collection
 */
var Users = /** @class */ (function (_super) {
    __extends(Users, _super);
    function Users() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Users;
}(BaseCollection));

var modeljs = new ModelJS();
modeljs.register([Enum, Id, Permalink, Profile, Profiles, User, Users]).boot();
var users$$1 = new Users(users$1);
console.log(users$$1.toJSON([], [], null, 2)); //users.toJSON(['profile.full_name'], [], null, 2));

})));
//# sourceMappingURL=index.js.map
