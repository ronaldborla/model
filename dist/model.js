
/**
 * Define Model
 */
window.Model = (function(window, undefined) {
  'use strict';

  /**
   * JS Model
   * @param schema The model schema
   * @param define Callback to define the methods 
   * @return The constructor of the new Model
   */
  var Model = function(schema, define) {

    // The constructor and the methods
    var Constructor = null,
        methods = {},
        virtuals = {},
        statics = {},
        utils = Model.utils;

    // Set $
    var $ = utils.$;

    /**
     * Get attr
     */
    var attr = function(self) {
      // Return
      return $(self).attributes;
    };

    /**
     * Construct the object
     * This sets default values for the attributes
     */
    var construct = function(self, args) {
      // Create attributes
      $(self).attributes = {};
      // Create listeners
      $(self).listeners = {};
      // Loop through schema
      self.schema.forEach(function(key) {
        // Only if default is defined
        if (key.hasDefault()) {
          // Set default value
          self[key.name] = key.getDefault(self);
        }
      });
      // Return self
      return self;
    };

    /**
     * Get attribute
     */
    methods.get = function(name) {
      // Return attribute
      return attr(this)[name];
    };

    /**
     * Set attribute
     */
    methods.set = function(name, value) {
      // The key
      var key = this.schema.get(name),
          // This attributes
          attributes = attr(this),
          // Previous
          previous = attributes[name];
      // Create
      attributes[name] = key.evaluate(value, this);
      // If result is an object
      if (attributes[name] && typeof attributes[name] === 'object') {
        // Set its parent
        utils.$(attributes[name]).parent = this;
      }
      // Call set attribute
      this.fire('setAttribute', [name, attributes[name], previous]);
      // Set specific attribute
      this.fire('set' + utils.ucfirst(name) + 'Attribute', [attributes[name], previous]);
      // If changed
      if (utils.typeCompare(key.type, attributes[name], previous)) {
        // Change
        this.change();
      }
      // Return self
      return this;
    };

    // Set define
    methods.define = utils.define;
    // Set on
    methods.on = utils.on;
    // Set fire
    methods.fire = utils.fire;
    // Set emit
    methods.emit = utils.emit;
    // Set change
    methods.change = utils.change;
    // Set throw
    methods.throw = utils.throw;

    /**
     * Load data
     * @param data The data to load
     */
    methods.load = function(data) {
      // The object
      var self = this;
      // If there's data
      if (utils.isDefined(data)) {
        // Loop through schema
        this.schema.forEach(function(key) {
          // If data is defined
          if (utils.isDefined(data[key.name])) {
            // Set data
            self[key.name] = data[key.name];
          }
        });
        // Call load
        this.fire('load');
      }
      // Return self
      return this;
    };

    /**
     * To object
     */
    methods.toObject = function(exclude) {
      // The object
      var self = this,
          object = {};
      // If defined
      if (utils.isDefined(exclude)) {
        // If string
        if (utils.is('String', exclude)) {
          // Put in array
          exclude = [exclude];
        }
        // If array
        if (utils.is('Array', exclude)) {
          // Convert
          exclude = utils.arrayOfStringsToObject(exclude);
        }
      } else {
        // Default to object
        exclude = {};
      }
      // If exclude is not object
      if (!utils.is('Object', exclude)) {
        // Error
        this.throw('`exclude` must be an object or an array of strings');
      }
      // Register value
      var registerValue = function(key) {
        // Key name
        var keyName = key.name || key;
        // Must not be excluded
        if (exclude[keyName] !== true) {
          // Get value
          var value = self[keyName],
              hasToObject = value && utils.isFunction(value.toObject);
          // If no toObject but object
          if (!hasToObject && utils.is('Object', value)) {
            // If date
            if (utils.is('Date', value)) {
              // Convert to string
              value = value.toString();
            } else {
              // Clean
              value = utils.cleanObject(value);
            }
          }
          // Set it
          object[keyName] = hasToObject ? value.toObject(exclude[keyName]) : value;
        }
      };
      // Loop through schema
      this.schema.forEach(registerValue);
      // Loop through virtuals
      this.schema.virtuals.forEach(registerValue);
      // Return
      return object;
    };

    /**
     * To json
     */
    methods.toJson = function(exclude, replacer, space) {
      // Return stringified
      return JSON.stringify(this.toObject(exclude), replacer, space);
    };

    /**
     * Constructor is a Model
     */
    statics.isModel = true;

    /**
     * Inherit the Model
     */
    statics.inherit = function(extendSchema, defineModel) {
      // Parent schema
      var parentSchema = this.prototype.schema,
          // The child schema
          childSchema = parentSchema.export(extendSchema),
          // Define methods
          methods = {},
          virtuals = {},
          statics = {};
      // Inherit
      return utils.inherit(parentSchema.Constructor, function(construct) {
        // Use defineModel
        return defineModel(construct, methods, virtuals, statics);
        // Define prototype
      }, function(proto, Constructor) {
        // Override schema
        proto.schema = new Model.Schema(Constructor, childSchema, parentSchema, utils.keys(virtuals || {}));
        // Extend
        return utils.extendConstructor(Constructor, methods, virtuals, statics);
      });
    };

    // If define is a callback
    if (utils.isFunction(define)) {
      // Call define and get the constructor
      Constructor = define(construct, methods, virtuals, statics);
    }

    // If Constructor is not a function
    if (!utils.isFunction(Constructor)) {
      // Create a default constructor
      Constructor = function Model(data) {
        // Do construct and load
        construct(this).load(data);
      };
    }

    // Initialize schema
    Constructor.prototype.schema = new Model.Schema(Constructor, schema, null, utils.keys(virtuals || {}));

    // Extend and return Constructor 
    return utils.extendConstructor(Constructor, methods, virtuals, statics);
  };

  // Return Model
  return Model;

  // Inject window
})(window);


/**
 * Common utilities
 */
(function(window, Model, undefined) {
  'use strict';

  // Utils
  var utils = {};

  /**
   * The sign
   */
  utils.sign = '__local__';

  /**
   * Type order
   */
  utils.typeOrder = [
    'Boolean',
    'Number',
    'String',
    'Date',
    'Array',
    'Model',
    'Collection',
    'Object'
  ];

  /**
   * Is defined
   */
  utils.isDefined = function(variable) {
    // Return
    return variable !== undefined;
  };

  /**
   * Is undefined
   */
  utils.isUndefined = function(variable) {
    // Return
    return !utils.isDefined(variable);
  };

  /**
   * Check if function
   */
  utils.isFunction = function(object) {
    // Return
    return !!(object && object.constructor && object.call && object.apply);
  };

  /**
   * Check if instance
   */
  utils.is = function(type, value) {
    // Set type as name
    type = type.name || type;
    // Return
    return Model.Schema.Types[type] && 
           Model.Schema.Types[type].is(value);
  };

  /**
   * Check if inherits
   */
  utils.inherits = function(type, Constructor) {
    // Set type as name
    type = type.name || type;
    // Return
    return Model.Schema.Types[type] && 
           Model.Schema.Types[type].inherits(Constructor);
  };

  /**
   * Sort
   */
  utils.sort = function(array, descending) {
    // Return
    array.sort(function(a, b) {
      // Return
      return !!descending ? (b - a) : (a - b);
    });
    // Return the array
    return array;
  };

  /**
   * Get keys
   */
  utils.keys = function(object, sort) {
    // Return
    var keys = window.Object.keys(object);
    // If there's sort
    if (typeof sort !== 'undefined') {
      // Sort
      utils.sort(keys, !sort);
    }
    // Return keys
    return keys;
  };

  /**
   * Get type
   */
  utils.type = function(value) {
    // Loop
    for (var i = 0; i < utils.typeOrder.length; i++) {
      // The type
      var type = Model.Schema.Types[utils.typeOrder[i]];
      // If match
      if (type.is(value)) {
        // Return type
        return type;
      }
    }
    // Return nothing
    return Model.Schema.Types.Any;
  };

  /**
   * Compare variables
   */
  utils.compare = function(a, b, deep, level) {
    // Get the types
    var aType = utils.type(a),
        bType = utils.type(b);
    // If types do not match
    if (aType.name !== bType.name) {
      // Return true
      return true;
    }
    // Return compare
    return utils.typeCompare(aType, a, b, deep, level);
  };

  /**
   * Type compare
   */
  utils.typeCompare = function(type, a, b, deep, level) {
    // If doesn't match type
    if (!type.is(a) || !type.is(b)) {
      // Return true
      return true;
    }
    // Compare
    return type.compare(a, b, deep, level);
  };

  /**
   * Loop over object
   */
  utils.forEach = function(object, callback) {
    // Apply relationships
    for (var o in object) {
      // If has own property
      if (object.hasOwnProperty(o)) {
        // Call
        if (callback.apply(object, [object[o], o, object]) === false) {
          // Return
          return false;
        }
      }
    }
    // True to signify loop completed
    return true;
  };

  /**
   * Extend object
   */
  utils.extend = function(left, right) {
    // Loop through right
    utils.forEach(right, function(value, name) {
      // Put to left
      left[name] = value;
    });
    // Return a
    return left;
  };

  /**
   * Uppercase first letter
   */
  utils.ucfirst = function(string) {
    // Return
    return string[0].toUpperCase() + string.substr(1);
  };

  /**
   * Array of strings to object
   */
  utils.arrayOfStringsToObject = function(strings) {
    // The object
    var object = {};
    // If array
    if (utils.is('Array', strings)) {
      // Loop
      strings.forEach(function(string) {
        // Split
        var arr = string.split('.'),
            name = arr[0],
            child = (arr.length > 1) ? arr.splice(1).join('.') : '';
        // If not yet defined
        if (utils.isUndefined(object[name])) {
          // Create array
          object[name] = [];
        }
        // If there's child
        if (child && object[name] !== true) {
          // Push
          object[name].push(child);
        } else {
          // Set as true
          object[name] = true;
        }
      });
    }
    // Loop through keys
    utils.keys(object).forEach(function(key) {
      // If array
      if (utils.is('Array', object[key])) {
        // Convert
        object[key] = utils.arrayOfStringsToObject(object[key]);
      }
    });
    // Return
    return object;
  };

  /**
   * Remove __local__
   */
  utils.cleanObject = function(dirty) {
    // New object
    var object = {};
    // Loop through
    utils.forEach(dirty, function(value, key) {
      // If not local
      if (key !== utils.sign) {
        // Set it
        object[key] = value;
      }
    });
    // Return
    return object;
  };

  /**
   * Inherit a Constructor
   */
  utils.inherit = function(Parent, getConstructor, definePrototype) {
    // The construct function
    var construct = function(child, args) {
      // Apply parent
      Parent.apply(child, args || []);
      // Return
      return child;
    };
    // Get constuctor
    var Constructor = getConstructor(construct);
    // Inherit prototype (use Object.create instead of 'new' keyword to omit execution of constructor)
    Constructor.prototype = window.Object.create(Parent.prototype);
    // Correct constructor
    Constructor.prototype.constructor = Constructor;
    // Extend any constructor methods
    utils.extend(Constructor, Parent);
    // If method
    if (utils.isFunction(definePrototype)) {
      // Define prototype
      definePrototype(Constructor.prototype, Constructor);
    }
    // Return constructor
    return Constructor;
  };

  /**
   * Extend constructor
   */
  utils.extendConstructor = function(Constructor, methods, virtuals, statics) {
    // The prototype
    var proto = Constructor.prototype;
    // Initialize
    methods = methods || {};
    virtuals = virtuals || {};
    statics = statics || {};
    /**
     * Extend methods to prototype
     */
    utils.extend(proto, methods);
    /**
     * Define virtuals
     */
    utils.forEach(virtuals, function(method, name) {
      // Define
      utils.define.apply(proto, [name, {
        // Get only since virtuals are read-only
        get: method
      }]);
    });
    /**
     * Extend statics to constructor
     */
    utils.extend(Constructor, statics);
    // Return Constructor
    return Constructor;
  };

  /**
   * Check if has sign
   */
  utils.hasSign = function(self) {
    // Return
    return utils.isDefined(self[utils.sign]);
  };

  /**
   * The private constructor variables
   */
  utils.$ = function(self) {
    // If there's no $
    if (!utils.hasSign(self)) {
      // Set it
      self[utils.sign] = {};
    }
    // Return
    return self[utils.sign];
  };

  /**
   * Get listeners
   */
  utils.events = function(self) {
    // If undefined
    if (utils.isUndefined(utils.$(self).listeners)) {
      // Set it
      utils.$(self).listeners = {};
    }
    // Return
    return utils.$(self).listeners;
  };

  /**
   * Define a property
   */
  utils.define = function(name, definition) {
    // Use defineProperty
    window.Object.defineProperty(this, name, definition);
    // Return self
    return this;
  };

  /**
   * Listen to an event
   */
  utils.on = function(event, callback) {
    // Get listeners
    var listeners = utils.events(this);
    // If there are no listeners
    if (!utils.is('Array', listeners[event])) {
      // Create empty
      listeners[event] = [];
      // Set counter
      listeners[event].count = 0;
    }
    // Make sure callback is a function
    if (utils.isFunction(callback)) {
      // Set listener index
      callback.index = listeners[event].count;
      // Push
      listeners[event].push(callback);
      // Increment count
      listeners[event].count++;
    }
    // Return a method that destroys the listener
    return function() {
      // Loop through listeners
      for (var i = 0; i < listeners[event].length; i++) {
        // If found
        if (listeners[event][i].index === callback.index) {
          // Splice
          listeners[event].splice(i, 1);
          // Quit loop
          break;
        }
      }
    };
  };

  /**
   * Fire an event
   */
  utils.fire = function(event, args) {
    // Set self
    var self = this,
        listeners = utils.events(this);
    // Check if there are listeners
    if (utils.is('Array', listeners[event])) {
      // Loop through listeners
      listeners[event].forEach(function(listener) {
        // Call it
        listener.apply(self, args || []);
      });
    }
    // Return self
    return this;
  };

  /**
   * Emit an event (upwards)
   * Emitting an event fires the event up to the root parent
   */
  utils.emit = function(event, args) {
    // Set parent
    var parent = this, 
        // Source stack is the stack of source models
        sourceStack = [this];
    // If there's no args
    if (!utils.is('Array', args)) {
      // Create empty array
      args = [];
    }
    // Source index is last
    var sourceIndex = args.length;
    // Push source stack
    args.push(sourceStack);
    // We're firing events up to the root parent
    while (true) {
      // Fire event
      parent.fire(event, [args]);
      // If there's parent and the parent has a fire event
      if (utils.isDefined(utils.$(parent).parent) && utils.isFunction(utils.$(parent).parent.fire)) {
        // Set new parent
        parent = utils.$(parent).parent;
        // Push source stack
        sourceStack.push(parent);
      } else {
        // Break
        break;
      }
    }
    // Return
    return this;
  };

  /**
   * Model has changed
   */
  utils.change = function() {
    // Use emit to let parents know about the change
    this.emit('change');
  };

  /**
   * Throw an error
   */
  utils.throw = function(message) {
    // Throw it
    Model.Exception.prototype.throw.apply(this, [message]);
  };

  // Set utils
  Model.utils = utils;

  // Inject window and Model
})(window, window.Model);


/**
 * Define Collection
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * Collection
   * Collection of Models
   */
  var Collection = function(ModelConstructor, define) {
    // Model constructor must be a model
    if (!utils.inherits('Model', ModelConstructor)) {
      // Throw error
      utils.throw('Constructor must inherit the Model constructor');
    }

    // The constructor and the methods
    var Constructor = null,
        methods = {},
        virtuals = {},
        statics = {},
        Arr = window.Array.prototype,
        call = function(method, array, args) {
          // Return
          return Arr[method].call(array, args || []);
        },
        apply = function(method, array, args) {
          // Return
          return Arr[method].apply(array, args || []);
        };

    // Set $
    var $ = utils.$;

    /**
     * Construct the object
     * This sets default values for the attributes
     */
    var construct = function(self) {
      // Create listeners
      $(self).listeners = {};
      // Return self
      return self;
    };

    // Set define
    methods.define = utils.define;
    // Set on
    methods.on = utils.on;
    // Set fire
    methods.fire = utils.fire;
    // Set emit
    methods.emit = utils.emit;
    // Set change
    methods.change = utils.change;
    // Set throw
    methods.throw = utils.throw;

    // If define is a callback
    if (utils.isFunction(define)) {
      // Call define and get the constructor
      Constructor = define(construct, methods, virtuals, statics);
    }

    // If Constructor is not a function
    if (!utils.isFunction(Constructor)) {
      // Create a default constructor
      Constructor = function Collection(data) {
        // Do construct and load
        construct(this).load(data);
      };
    }

    /**
     * Constructor is a collection
     */
    statics.isCollection = true;
    
    // Unlike in a Model, we don't want to execute Array's default constructor
    return utils.inherit(window.Array, function() {
      // Return Constructor
      return Constructor;
      // Define prototype
    }, function(proto, Collection) {

      /**
       * Set ModelConstructor
       */
      proto.Model = ModelConstructor;

      /**
       * Convert item to Model
       */
      proto.convert = function(item) {
        // If not an instance of Constructor
        if (!(item instanceof this.Model)) {
          // Create
          item = new this.Model(item);
        }
        // Set parent
        utils.$(item).parent = this;
        // Return item
        return item;
      };

      /**
       * Load data
       */
      proto.load = function(items) {
        // Empty first
        this.length = 0;
        // Push data
        this.push.apply(this, items);
        // Return self
        return this;
      };

      /**
       * Override push
       */
      proto.push = function() {
        // Self
        var self = this;
        // Push arguments
        return apply('push', this, call('slice', arguments || {}).map(function(arg) {
          // Return
          return self.convert(arg);
        }));
      };

      /**
       * Override fill
       */
      proto.fill = function() {
        // If there's first argument
        if (utils.isDefined(arguments[0])) {
          // Convert
          arguments[0] = this.convert(arguments[0]);
        }
        // Apply
        return apply('fill', this, arguments);
      };

      /**
       * Override splice
       */
      proto.splice = function() {
        // Get args
        var args = call('slice', arguments || {});
        // If length is greater than 2
        if (args.length > 2) {
          // Loop through args
          for (var i = 2; i < args.length; i++) {
            // Convert each
            args[i] = this.convert(args[i]);
          }
        }
        // Return
        return apply('splice', this, args);
      };

      /**
       * Override unshift
       */
      proto.unshift = function() {
        // Self
        var self = this;
        // Push arguments
        return apply('unshift', this, call('slice', arguments || {}).map(function(arg) {
          // Return
          return self.convert(arg);
        }));
      };

      /**
       * To object
       */
      proto.toObject = function(exclude) {
        // Map
        return this.map(function(item) {
          // Return object
          return item.toObject(exclude);
        });
      };

      /**
       * To json
       */
      proto.toJson = function(exclude, replacer, space) {
        // Return stringified
        return JSON.stringify(this.toObject(exclude), replacer, space);
      };

      // Extend Constructor
      return utils.extendConstructor(Collection, methods, virtuals, statics);
    });
  };

  // Set Collection
  Model.Collection = Collection;

  // Inject window, Model, and utils
})(window, window.Model, window.Model.utils);


/**
 * Define Exception
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * The Exception
   */
  var Exception = utils.inherit(window.Error, function(construct) {
    // Return Constructor
    return function Exception(message, source) {
      // Construct
      var self = construct(this);

      // Set message
      this.message = message;
      // Set source
      this.source = source;
      // Set stack
      this.stack = (new Error()).stack;
    };
  });

  /**
   * Throw error
   */
  Exception.prototype.throw = function(message) {
    // Throw error
    throw new Exception(message, this);
  };

  // Set Exception
  Model.Exception = Exception;

  // Inject Model
})(window, window.Model, window.Model.utils);


/**
 * Define Schema
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * The Schema
   * Inherit Array
   */
  var Schema = utils.inherit(window.Array, function(construct) {
    // Return Constructor
    return function Schema(Constructor, schema, parent, virtuals) {
      // Self
      var self = construct(this);

      // This Constructor
      this.Constructor = Constructor;
      // Parent schema
      this.parent = parent || null;
      // The virtuals
      this.virtuals = virtuals || [];

      // If there's parent
      if (this.parent) {
        // Inherit virtuals
        this.parent.virtuals.forEach(function(virtual) {
          // Add if not exists
          if (self.virtuals.indexOf(virtual) < 0) {
            // Push
            self.virtuals.push(virtual);
          }
        });
      }

      // If there's schema
      if (utils.isDefined(schema)) {
        // Loop
        utils.forEach(schema, function(definition, name) {
          // Set it
          self.set(name, definition);
        });
      }
    };
    // Define prototype
  }, function(proto, Schema) {

    /**
     * Get schema
     */
    proto.get = function(name) {
      // Set index
      var index = -1;
      // Check for index
      if (!utils.isDefined(this.index)) {
        // Set index
        this.index = {};
      }
      // If index is defined
      if (utils.isDefined(this.index[name])) {
        // Set index
        index = this.index[name];
      }
      // If there's no index
      if (index <= 0) {
        // Find
        for (var i = 0; i < this.length; i++) {
          // Match name
          if (this[i].name === name) {
            // Put into index
            this.index[name] = index = i;
            break;
          }
        }
      }
      // Return key
      return this[index];
    };

    /**
     * Set Schema
     * Translate from raw schema
     */
    proto.set = function(name, definition) {
      // Push translated
      this.push(new Schema.Key(this, name, definition));
    };

    /**
     * Export Schema
     */
    proto.export = function(extend) {
      // All keys
      var json = {};
      // Loop through keys
      this.forEach(function(key) {
        // Add to json
        json[key.name] = key.export();
      });
      // Return
      return utils.extend(json, extend || {});
    };

  });

  // Set Schema
  Model.Schema = Schema;

  // Inject window, Model, and utils
})(window, window.Model, window.Model.utils);


/**
 * Define Type
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * Property Type
   */
  var Type = function(name, Constructor, native) {
    // Self
    var self = this;
    // Set it
    this.name = name;
    // Raw type
    this.raw = (name || '').toLowerCase();
    // Set Constructor
    this.Constructor = Constructor || null;
    // Type is native
    this.native = !!native;
    // Original type
    this.original = null;
  };

  // Check if constructor matches
  Type.prototype.match = function(check) {
    // If check is instance of Self
    if (check instanceof (this.prototype || this).constructor) {
      // Return match
      return this.match(check.name);
    }
    // Match
    var match = 'Constructor';
    // If string
    if (utils.is('String', check)) {
      // Match by name
      match = 'name';
    }
    // Return
    return this[match] === check;
  };

  /**
   * Check if a variable is a type or instance of constructor
   */
  Type.prototype.is = function(value) {
    // Get type
    var type = ((typeof value) || '').toLowerCase();
    // If object
    if (type === 'object') {
      // If object, match constructor
      if (value instanceof this.Constructor) {
        // Return true
        return true;
      }
    }
    // Match
    return (this.raw === type);
  };

  /**
   * Inherits constructor
   */
  Type.prototype.inherits = function(Constructor) {
    // Check
    return utils.isFunction(Constructor) &&
           (this.Constructor === Constructor);
  };
  
  /**
   * Compare
   */
  Type.prototype.compare = function(a, b, deep, level) {
    // Return
    return a - b;
  };

  // Set Type to Schema
  Model.Schema.Type = Type;

  /**
   * Model property types
   */
  Model.Schema.Types = {};

  // Inject Model
})(window, window.Model, window.Model.utils);

/**
 * Any type
 */
(function(window, Type, Types, utils) {
  'use strict';

  /**
   * Create type
   */
  Types.Any = new Type('Any');

  /**
   * Compare objects
   */
  Types.Any.compare = function(a, b, deep, level) {
    // Return
    return false;
  };

  /**
   * Always return true
   */
  Types.Any.is = function(value) {
    // Return true
    return true;
  };
  
  /**
   * Inherits constructor
   */
  Types.Any.inherits = function(Constructor) {
    // Check
    return false;
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);

/**
 * Array type
 */
(function(window, Type, Types, utils) {
  'use strict';

  /**
   * Create type
   */
  Types.Array = new Type('Array', window.Array, true);

  /**
   * Compare
   */
  Types.Array.compare = function(a, b, deep, level) {
    // If length do not match
    if (a.length !== b.length) {
      // Return
      return true;
    }
    // If deep or no level
    if (deep || !level) {
      // Loop through
      for (var i = 0; i < a.length; a++) {
        // Get item
        var aItem = a[i],
            bItem = b[i];
        // Compare
        if (utils.compare(aItem, bItem, deep, (level || 0) + 1)) {
          // Return true
          return true;
        }
      }
    }
    // Return false by default
    return false;
  };

  /**
   * Check if array
   */
  Types.Array.is = function(value) {
    // Return
    return value && ((value.constructor === window.Array) || (value instanceof window.Array));
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);

/**
 * Boolean type
 */
(function(window, Type, Types) {
  'use strict';

  /**
   * Create type
   */
  Types.Boolean = new Type('Boolean', window.Boolean, true);

  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);

/**
 * Collection type
 */
(function(window, Collection, Type, Types, utils) {
  'use strict';

  /**
   * Create type
   */
  Types.Collection = new Type('Collection');

  /**
   * Compare objects
   */
  Types.Collection.compare = function(a, b, deep, level) {
    // If not the same constructor
    if (a.constructor !== b.constructor) {
      // Return
      return true;
    }
    // If deep or there's no level
    if (deep || !level) {
      // Loop through schema
      for (var i = 0; i < a.length; i++) {
        // Compare
        if (utils.typeCompare(Types.Model, a[i], b[i], deep, (level || 0) + 1)) {
          // Return true
          return true;
        }
      }
    }
    // Return false
    return false;
  };
  
  /**
   * Check if Collection
   */
  Types.Collection.is = function(value) {
    // If there's isCollection
    return value && 
           value.prototype && 
           value.prototype.constructor &&
           value.prototype.constructor.isCollection;
  };
  
  /**
   * Inherits constructor
   */
  Types.Collection.inherits = function(Constructor) {
    // Check
    return utils.isFunction(Constructor) && !!Constructor.isCollection;
  };
  
  // Inject
})(window, 
   window.Model.Collection, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);

/**
 * Date type
 */
(function(window, Type, Types) {
  'use strict';

  /**
   * Create type
   */
  Types.Date = new Type('Date', window.Date, true);
  
  /**
   * Check if Date
   */
  Types.Date.is = function(value) {
    // Return
    return value && ((value.constructor === window.Date) || (value instanceof window.Date));
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);

/**
 * Model type
 */
(function(window, Model, Type, Types, utils) {
  'use strict';

  /**
   * Create type
   */
  Types.Model = new Type('Model');

  /**
   * Compare objects
   */
  Types.Model.compare = function(a, b, deep, level) {
    // If not the same constructor
    if (a.constructor !== b.constructor) {
      // Return
      return true;
    }
    // If deep or there's no level
    if (deep || !level) {
      // Loop through schema
      for (var i = 0; i < a.schema.length; i++) {
        // Set key
        var key = a.schema[i];
        // Compare
        if (utils.typeCompare(key.type, a[key.name], b[key.name], deep, (level || 0) + 1)) {
          // Return true
          return true;
        }
      }
    }
    // Return false
    return false;
  };

  /**
   * Check if Model
   */
  Types.Model.is = function(value) {
    // If there's isModel
    return value && 
           value.prototype && 
           value.prototype.constructor &&
           value.prototype.constructor.isModel;
  };
  
  /**
   * Inherits constructor
   */
  Types.Model.inherits = function(Constructor) {
    // Check
    return utils.isFunction(Constructor) && !!Constructor.isModel;
  };
  
  // Inject
})(window, 
   window.Model, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);

/**
 * Number type
 */
(function(window, Type, Types) {
  'use strict';

  /**
   * Create type
   */
  Types.Number = new Type('Number', window.Number, true);
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);

/**
 * Object type
 */
(function(window, Type, Types, utils) {
  'use strict';

  /**
   * Create type
   */
  Types.Object = new Type('Object', window.Object, true);

  /**
   * Compare objects
   */
  Types.Object.compare = function(a, b, deep, level) {
    // Get keys
    var aKeys = utils.keys(a, true),
        bKeys = utils.keys(b, true);
    // If not the same
    if (aKeys.length !== bKeys.length) {
      // Return
      return true;
    }
    // Compare
    if (deep || !level) {
      // Loop
      for (var i = 0; i < aKeys.length; i++) {
        // Get key
        var aKey = aKeys[i],
            bKey = bKeys[i];
        // If not the same key
        if (aKey !== bKey) {
          // Return
          return true;
        }
        // Compare
        if (utils.compare(aKey, bKey, deep, (level || 0) + 1)) {
          // Return true
          return true;
        }
      }
    }
    // Return false by default
    return false;
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);

/**
 * Self type
 */
(function(window, Type, Types, utils) {
  'use strict';

  /**
   * Create type
   */
  Types.Self = new Type('Self');

  /**
   * Compare objects
   */
  Types.Self.compare = function(a, b, deep, level) {
    // Return
    return false;
  };
  
  /**
   * Always return false
   */
  Types.Self.is = function(value) {
    // Return false
    return false;
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);

/**
 * String type
 */
(function(window, Type, Types) {
  'use strict';

  /**
   * Create type
   */
  Types.String = new Type('String', window.String, true);

  /**
   * Compare
   */
  Types.String.compare = function(a, b, deep, level) {
    // If less than b
    if (a < b) {
      // Return -1
      return -1;
    }
    // If greater
    if (a > b) {
      // Return 1
      return 1;
    }
    // Return 0
    return 0;
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);


/**
 * Define Key
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * Key attributes
   */
  var keyAttributes = ['enum'];

  /**
   * Schema Key
   */
  var Key = function(schema, name, definition) {
    // Self
    var self = this;

    // Set definition
    definition = definition || {};

    // Set schema
    this.schema = schema;
    // Set name
    this.name = name;
    // Set type
    this.type = Model.Schema.Types.Any;
    // Set default
    this.default = definition.default;
    // Set nullable true by default
    this.null = utils.is('Boolean', definition.null) ? definition.null : true;

    // The translated
    var type = definition.type || definition;
    
    // If type is a string
    if (utils.is('String', type)) {
      // Get from Types
      type = Model.Schema.Types[type];
    }

    // If instance of Type
    if (type instanceof Model.Schema.Type) {
      // If type is self
      if (type.match('Self')) {
        // Create new based on self
        this.type = new Model.Schema.Type(type.name, this.schema.Constructor);
        // Set original
        this.type.original = type;
        // Otherwise
      } else {
        // Set as the Type
        this.type = type;
      }
      // Otherwise
    } else {
      // Loop through types
      utils.forEach(Model.Schema.Types, function(propType) {
        // If native
        if (propType.native && propType.match(type)) {
          // Just set
          self.type = propType;
          // Return false
          return false;
          // If model or collection
        } else if ((propType.match(Model.Schema.Types.Model)       && utils.inherits('Model', type)) ||
                   (propType.match(Model.Schema.Types.Collection)  && utils.inherits('Collection', type))) {
          // Create new type
          self.type = new Model.Schema.Type(propType.name, type);
          // Return false
          return false;
        }
      });
    }

    // Keep other attributes
    keyAttributes.forEach(function(attribute) {
      // If defined
      if (utils.isDefined(definition[attribute])) {
        // Set it
        self.filter(attribute, definition[attribute]);
      }
    });

    // The schema Constructor's prototype
    var proto = schema.Constructor.prototype;

    // Define property for Model
    utils.define.apply(proto, [name, {
      // Get the property
      get: function() {
        // Use get
        return proto.get.apply(this, [name]);
      },
      // Set the property
      set: function(value) {
        // Use set
        proto.set.apply(this, [name, value]);
      }
    }]);
  };

  /**
   * Evaluate
   */
  Key.prototype.evaluate = function(value, model) {
    // Has model
    var hasModel = utils.isDefined(model),
        // Current value
        current = hasModel ? model.get(this.name) : undefined,
        // Is defined
        defined = utils.isDefined(current) && (current !== null),
        // Result
        result = current;
    // Check if null
    if (value === null) {
      // If nullable
      if (!!this.null) {
        // Return
        return null;
      }
      // Throw error
      this.throw('`' + this.name + '` cannot be null', model);
    }
    // Select Type
    switch (this.type.name) {
      // Model
      case Model.Schema.Types.Model.name:
      // Collection
      case Model.Schema.Types.Collection.name:
      // Or self
      case Model.Schema.Types.Self.name:
        // If defined
        if (defined) {
          // Load
          current.load(value);
          // If value is instance of the given constructor
        } else if (value instanceof this.type.Constructor) {
          // Just replace
          result = value;
          // Otherwise
        } else {
          // Create new 
          result = new this.type.Constructor(value);
        }
        break;
      // If date
      case Model.Schema.Types.Date.name:
        // Initialize
        result = new this.type.Constructor(value || null);
        break;
      // Array
      case Model.Schema.Types.Array.name:
        // Set value
        value = utils.is('Array', value) ? value : (utils.isDefined(value) ? [value] : []);
        // If defined
        if (defined) {
          // Empty first
          current.length = 0;
          // Push
          current.push.apply(current, value);
          // Otherwise
        } else {
          // Set it
          result = value;
        }
        break;
      // Any
      case Model.Schema.Types.Any.name:
        // Set normally
        result = value;
        break;
      // Else
      default:
        // If string and there's enum
        if (this.type.match(Model.Schema.Types.String) && utils.is('Array', this.enum)) {
          // If not valid enum
          if (!this.isValidEnum(value)) {
            // Throw error
            this.throw('Invalid enum value: ' + value, model);
          }
        }
        // Set normally
        result = utils.isDefined(value) ? this.type.Constructor(value) : this.type.Constructor();
        break;
    }
    // Return result
    return result;
  };

  /**
   * Has default
   */
  Key.prototype.hasDefault = function() {
    // Return
    return utils.isDefined(this.default);
  };

  /**
   * Get default value
   */
  Key.prototype.getDefault = function(model) {
    // Execute if method
    return utils.isFunction(this.default) ? 
           // Call method
           this.default.apply(this, utils.isDefined(model) ? [model] : []) :
           // Return as is
           this.default;
  };

  /**
   * Enum
   */
  Key.prototype.isValidEnum = function(value) {
    // Return
    return this.enum.indexOf(value) >= 0;
  };

  /**
   * Filter definition
   */
  Key.prototype.filter = function(attribute, value) {
    // Select
    switch (attribute) {
      // Enum
      case 'enum':
        // Value must be an array of strings
        var items = utils.is('Array', value) ? value : [value],
            enumerable = [];
        // Loop
        items.forEach(function(item) {
          // Add only if string and not empty
          if (utils.is('String', item) && item.length) {
            // Push to enum
            enumerable.push(item);
          }
        });
        // Set enumerable
        this[attribute] = enumerable;
        // If there's default
        if (this.hasDefault()) {
          // Get default value
          var defaultValue = this.getDefault();
          // If not valid enum
          if (!this.isValidEnum(defaultValue)) {
            // Throw
            this.throw('Invalid enum default value: ' + defaultValue);
          }
        }
        break;
    }
  };

  /**
   * Throw error
   */
  Key.prototype.throw = function(message, model) {
    // Do throw
    Model.Exception.prototype.throw.apply(model || this, [message]);
  };

  /**
   * Export key
   */
  Key.prototype.export = function() {
    // Json
    var self = this, json = {
      type: this.type.original || this.type
    };
    // If there's default
    if (this.hasDefault()) {
      // Add
      json.default = this.default;
    }
    // Loop through attributes
    keyAttributes.forEach(function(attribute) {
      // If set
      if (utils.isDefined(self[attribute])) {
        // Add
        json[attribute] = self[attribute];
      }
    });
    // Return
    return json;
  };

  // Set Key
  Model.Schema.Key = Key;

  // Inject window, Model, and utils
})(window, window.Model, window.Model.utils);
