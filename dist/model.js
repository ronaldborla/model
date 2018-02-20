/**
 * Define Model
 */
(function(window, undefined) {
  'use strict';

  window.Model = Model;

  ////////

  /**
   * JS Model
   * @param schema The model schema
   * @param define Callback to define the methods 
   * @return The constructor of the new Model
   */
  function Model(schema, define) {
    var $           = Model.utils.$,
        Constructor = null,
        methods     = {},
        options     = {},
        statics     = {},
        utils       = Model.utils,
        virtuals    = {};

    methods.change    = utils.change;
    methods.define    = utils.define;
    methods.emit      = utils.emit;
    methods.filter    = filterData;
    methods.fire      = utils.fire;
    methods.get       = getAttribute;
    methods.load      = loadData;
    methods.on        = utils.on;
    methods.set       = setAttribute;
    methods.throw     = utils.throw;
    methods.toJson    = toJson;
    methods.toObject  = toObject;

    statics.inherit   = inherit;
    statics.isModel   = true;

    if (utils.isFunction(define)) {
      Constructor = define(construct, methods, virtuals, statics, options);
    }

    if (!utils.isFunction(Constructor)) {
      // Create a default constructor
      Constructor = function Model(data) {
        construct(this).load(data);
      };
    }

    // Initialize schema
    Constructor.prototype.schema = new Model.Schema(Constructor, 
                                                    schema, 
                                                    null, 
                                                    utils.keys(virtuals || {}),
                                                    options);

    return utils.extendConstructor(Constructor, methods, virtuals, statics);

    ////////

    /**
     * Get attr
     */
    function attr(self) {
      return $(self).attributes;
    }

    /**
     * Construct the object
     * This sets default values for the attributes
     */
    function construct(self, args) {
      $(self).attributes  = {};
      $(self).listeners   = {};
      var l = self.schema.length,
          i = l;
      while (i--) {
        // Only if default is defined
        if (self.schema[l - i - 1].hasDefault()) {
          self[self.schema[l - i - 1].name] = self.schema[l - i - 1].getDefault(self);
        }
      }
      return self;
    }

    /**
     * Filter
     */
    function filterData(name, data) {
      // Return data
      return data;
    }

    /**
     * Get attribute
     */
    function getAttribute(name) {
      var method = this.schema.cache.mutators.get[name],
          orig = attr(this)[name];
      if (utils.isUndefined(method)) {
        var mutator = utils.camelCase(['get', name, 'attribute'].join(' '));
        method = this.schema.cache.mutators.get[name] = (utils.isFunction(this[mutator]) ? mutator : null);
      }
      if (method) {
        return this[method].apply(this, [orig]);
      } else {
        return orig;
      }
    }

    /**
     * Inherit the Model
     */
    function inherit(extendSchema, defineModel) {
      var parentSchema  = this.prototype.schema,
          childSchema   = parentSchema.export(extendSchema),
          methods       = {},
          options       = utils.clone(parentSchema.options || {}),
          statics       = {},
          virtuals      = {};
      // Inherit parent
      return utils.inherit(parentSchema.Constructor, function(construct) {
        return defineModel(construct, methods, virtuals, statics, options);
      }, function(proto, Constructor) {
        proto.schema = new Model.Schema(Constructor, 
                                        childSchema, 
                                        parentSchema, 
                                        utils.keys(virtuals || {}),
                                        options);
        return utils.extendConstructor(Constructor, methods, virtuals, statics);
      });
    }

    /**
     * Load data
     * @param data The data to load
     */
    function loadData(data) {
      var self = this;
      // Call filter
      data = this.filter('load', data);
      // If there's data
      if (utils.isDefined(data)) {
        this.fire('beforeload', [data]);
        var l = this.schema.length,
            i = l;
        while (i--) {
          // If data is defined
          if (utils.isDefined(data[this.schema[l - i - 1].name])) {
            self[this.schema[l - i - 1].name] = data[this.schema[l - i - 1].name];
          }
        }
        this.fire('load');
      }
      return this;
    }

    /**
     * Set attribute
     */
    function setAttribute(name, value) {
      var method      = this.schema.cache.mutators.set[name],
          key         = this.schema.get(name),
          attributes  = attr(this),
          previous    = attributes[name],
          evaluated   = key.evaluate(value, this);
      if (utils.isUndefined(method)) {
        var mutator = utils.camelCase(['set', name, 'attribute'].join(' '));
        method = this.schema.cache.mutators.set[name] = (utils.isFunction(this[mutator]) ? mutator : null);
      }
      // If method is set
      if (method) {
        attributes[name] = this[method].apply(this, [evaluated, previous]);
      } else {
        attributes[name] = evaluated;
      }
      // If result is an object
      if (attributes[name] && typeof attributes[name] === 'object') {
        utils.$(attributes[name]).parent = this;
      }
      this.fire('setAttribute', [name, attributes[name], previous]);
      this.fire(method, [attributes[name], previous]);
      // If changed
      if (utils.typeCompare(key.type, attributes[name], previous)) {
        this.change();
      }
      return this;
    }

    /**
     * To json
     */
    function toJson(exclude, replacer, space) {
      return JSON.stringify(this.toObject(exclude), replacer, space);
    }

    /**
     * To object
     */
    function toObject(exclude) {
      var i = 0,
          l = 0,
          self    = this,
          object  = {};
      if (utils.isDefined(exclude)) {
        if (utils.is('String', exclude)) {
          exclude = [exclude];
        }
        if (utils.is('Array', exclude)) {
          exclude = utils.arrayOfStringsToObject(exclude);
        }
      } else {
        exclude = {};
      }
      if (!utils.is('Object', exclude)) {
        this.throw('`exclude` must be an object or an array of strings');
      }
      // Register value
      function registerValue(key) {
        var keyName = key.name || key;
        // Must not be excluded
        if (exclude[keyName] !== true) {
          var exportMethod  = utils.camelCase(['export', keyName, 'attribute'].join(' ')),
              value         = utils.isFunction(self[exportMethod]) ?
                              self[exportMethod].apply(self, [self[keyName]]) :
                              self[keyName],
              hasToObject   = value && utils.isFunction(value.toObject);
          // If no toObject but object and not array
          if (!hasToObject              && 
              utils.is('Object', value) &&
              !utils.is('Array', value)) {
            if (utils.is('Date', value)) {
              value = value.toString();
            } else {
              value = utils.cleanObject(value);
            }
          }
          object[keyName] = hasToObject ? value.toObject(exclude[keyName]) : value;
        }
      }
      i = l = this.schema.length;
      while (i--) {
        registerValue(this.schema[l - i - 1]);
      }
      // If there's virtuals in export
      if (this.schema.options         &&
          this.schema.options.export  &&
          !!this.schema.options.export.virtuals) {
        i = l = this.schema.virtuals.length;
        while (i--) {
          registerValue(this.schema.virtuals[l - i - 1]);
        }
      }
      object = this.filter('export', object);
      this.fire('export', [object, exclude]);
      return object;
    }
  }
})(window);
/**
 * Common utilities
 */
(function(window, Model, undefined) {
  'use strict';

  var utils = {};

  Model.utils = utils;

  utils.sign                    = '__local__';
  utils.typeOrder               = [
    'Boolean',
    'Number',
    'String',
    'Date',
    'Array',
    'Model',
    'Collection',
    'Object'
  ];

  utils.$                       = dollarSign;
  utils.arrayOfStringsToObject  = arrayOfStringsToObject;
  utils.camelCase               = camelCase;
  utils.change                  = changeModel;
  utils.cleanObject             = cleanObject;
  utils.clone                   = cloneObject;
  utils.compare                 = compareType;
  utils.define                  = defineProperty;
  utils.emit                    = emitEvent;
  utils.events                  = getListeners;
  utils.extend                  = extendObject;
  utils.extendConstructor       = extendConstructor;
  utils.fire                    = fireEvent;
  utils.forEach                 = forEachObject;
  utils.hasSign                 = hasSign;
  utils.inherit                 = inheritConstructor;
  utils.inherits                = inherits;
  utils.is                      = isType;
  utils.isDefined               = isDefined;
  utils.isFunction              = isFunction;
  utils.isUndefined             = isUndefined;
  utils.keys                    = getKeys;
  utils.on                      = onEvent;
  utils.sort                    = sortArray;
  utils.throw                   = throwException;
  utils.type                    = getType;
  utils.typeCompare             = typeCompare;
  utils.ucfirst                 = ucfirst;

  ////////

  /**
   * Array of strings to object
   */
  function arrayOfStringsToObject(strings) {
    var i       = 0,
        l       = 0,
        object  = {};
    // If array
    if (utils.is('Array', strings)) {
      i = l = strings.length;
      while (i--) {
        var arr   = strings[l - i - 1].split('.'),
            name  = arr[0],
            child = (arr.length > 1) ? arr.splice(1).join('.') : '';
        if (utils.isUndefined(object[name])) {
          object[name] = [];
        }
        // If there's child
        if (child && object[name] !== true) {
          object[name].push(child);
        } else {
          object[name] = true;
        }
      }
    }
    var keys = utils.keys(object);
    i = l = keys.length;
    while (i--) {
      if (utils.is('Array', object[keys[l - i - 1]])) {
        object[keys[l - i - 1]] = utils.arrayOfStringsToObject(object[keys[l - i - 1]]);
      }
    }
    return object;
  }

  /**
   * To camel case
   */
  function camelCase(str) {
    return str.replace(/[-_]+/g, ' ').replace(/(?:^\w|[A-Z]|\b\w|[\s-_]+)/g, function(match, index) {
      if (+match === 0) {
        return ''; // or if (/\s+/.test(match)) for white spaces
      }
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

  /**
   * Model has changed
   */
  function changeModel() {
    // Use emit to let parents know about the change
    this.emit('change');
  }

  /**
   * Remove __local__
   */
  function cleanObject(dirty) {
    // New object
    var keys  = window.Object.keys(dirty),
        l     = keys.length,
        i     = l,
        object = {};
    while (i--) {
      if (keys[l - i - 1] !== utils.sign) {
        object[keys[l - i - 1]] = dirty[keys[l - i - 1]];
      }
    }
    return object;
  }

  /**
   * Clone an object
   */
  function cloneObject(object) {
    return JSON.parse(JSON.stringify(object));
  }

  /**
   * Compare variables
   */
   function compareType(a, b, deep, level) {
    var aType = utils.type(a),
        bType = utils.type(b);
    // If types do not match
    if (aType.name !== bType.name) {
      return true;
    }
    return utils.typeCompare(aType, a, b, deep, level);
  }

  /**
   * Define a property
   */
  function defineProperty(name, definition) {
    window.Object.defineProperty(this, name, definition);
    return this;
  }

  /**
   * The private constructor variables
   */
  function dollarSign(self) {
    if (!utils.hasSign(self)) {
      self[utils.sign] = {};
    }
    return self[utils.sign];
  }

  /**
   * Emit an event (upwards)
   * Emitting an event fires the event up to the root parent
   */
  function emitEvent(event, args) {
    var parent = this, 
        sourceStack = [this];
    if (!utils.is('Array', args)) {
      args = [];
    }
    // Source index is last
    var sourceIndex = args.length;
    args.push(sourceStack);
    // We're firing events up to the root parent
    while (true) {
      parent.fire(event, args);
      // If there's parent and the parent has a fire event
      if (utils.isDefined(utils.$(parent).parent) && 
          utils.isFunction(utils.$(parent).parent.fire)) {
        // Set new parent
        parent = utils.$(parent).parent;
        sourceStack.push(parent);
      } else {
        break;
      }
    }
    return this;
  }

  /**
   * Extend constructor
   */
   function extendConstructor(Constructor, methods, virtuals, statics) {
    var proto = Constructor.prototype;
    methods   = methods || {};
    virtuals  = virtuals || {};
    statics   = statics || {};
    // Methods
    utils.extend(proto, methods);
    // Virtuals
    var keys = window.Object.keys(virtuals),
        l     = keys.length,
        i     = l;
    while (i--) {
      utils.define.apply(proto, [keys[l - i - 1], {
        // Get only since virtuals are read-only
        get: virtuals[keys[l - i - 1]]
      }]);
    }
    // Statics
    utils.extend(Constructor, statics);
    return Constructor;
  }

  /**
   * Extend object
   */
  function extendObject(left, right) {
    utils.forEach(right, function(value, name) {
      left[name] = value;
    });
    return left;
  }

  /**
   * Fire an event
   */
  function fireEvent(event, args) {
    var self = this,
        listeners = utils.events(this);
    // Check if there are listeners
    if (utils.is('Array', listeners[event])) {
      var l = listeners[event].length,
          i = l;
      while (i--) {
        listeners[event][l - i - 1].apply(self, args || []);
      }
    }
    return this;
  }

  /**
   * Loop over object
   */
  function forEachObject(object, callback) {
    for (var o in object) {
      // If has own property
      if (object.hasOwnProperty(o)) {
        if (callback.apply(object, [object[o], o, object]) === false) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get keys
   */
  function getKeys(object, sort) {
    var keys = window.Object.keys(object);
    if (typeof sort !== 'undefined') {
      utils.sort(keys, !sort);
    }
    return keys;
  }

  /**
   * Get listeners
   */
  function getListeners(self) {
    if (utils.isUndefined(utils.$(self).listeners)) {
      utils.$(self).listeners = {};
    }
    return utils.$(self).listeners;
  }

  /**
   * Get type
   */
  function getType(value) {
    var l = utils.typeOrder.length,
        i = l;
    while (i--) {
      var type = Model.Schema.Types[utils.typeOrder[l - i - 1]];
      if (type.is(value)) {
        return type;
      }
    }
    return Model.Schema.Types.Any;
  }

  /**
   * Check if has sign
   */
  function hasSign(self) {
    return utils.isDefined(self[utils.sign]);
  }

  /**
   * Inherit a Constructor
   */
  function inheritConstructor(Parent, getConstructor, definePrototype) {
    var construct = function(child, args) {
      Parent.apply(child, args || []);
      return child;
    };
    var Constructor = getConstructor(construct);
    Constructor.prototype             = window.Object.create(Parent.prototype);
    Constructor.prototype.constructor = Constructor;
    // Extend any constructor methods
    utils.extend(Constructor, Parent);
    // If definePrototype is defined as method
    if (utils.isFunction(definePrototype)) {
      definePrototype(Constructor.prototype, Constructor);
    }
    return Constructor;
  }

  /**
   * Check if inherits
   */
  function inherits(type, Constructor) {
    // Set type as name
    type = type.name || type;
    // Return
    return Model.Schema.Types[type] && 
           Model.Schema.Types[type].inherits(Constructor);
  }

  /**
   * Is defined
   */
  function isDefined(variable) {
    return variable !== undefined;
  }

  /**
   * Check if function
   */
  function isFunction(object) {
    return !!(object              && 
              object.constructor  && 
              object.call         && 
              object.apply);
  }

  /**
   * Check if instance
   */
  function isType(type, value) {
    type = type.name || type;
    return Model.Schema.Types[type] && 
           Model.Schema.Types[type].is(value);
  }

  /**
   * Is undefined
   */
  function isUndefined(variable) {
    return variable === undefined;
  }

  /**
   * Listen to an event
   */
  function onEvent(event, callback) {
    var listeners = utils.events(this);
    // If there are no listeners
    if (!utils.is('Array', listeners[event])) {
      listeners[event] = [];
      listeners[event].count = 0;
    }
    // Make sure callback is a function
    if (utils.isFunction(callback)) {
      callback.index = listeners[event].count;
      listeners[event].push(callback);
      listeners[event].count++;
    }
    // Return a method that destroys the listener
    return function() {
      var l = listeners[event].length,
          i = l;
      while (i--) {
        if (listeners[event][l - i - 1].index === callback.index) {
          listeners[event].splice(l - i - 1, 1);
          break;
        }
      }
    };
  }

  /**
   * Sort
   */
  function sortArray(array, descending) {
    array.sort(function(a, b) {
      return !!descending ? (b - a) : (a - b);
    });
    return array;
  }

  /**
   * Throw an exception
   */
  function throwException(message) {
    Model.Exception.prototype.throw.apply(this, [message]);
  }

  /**
   * Type compare
   */
  function typeCompare(type, a, b, deep, level) {
    // If doesn't match type
    if (!type.is(a) || !type.is(b)) {
      return true;
    }
    return type.compare(a, b, deep, level);
  }

  /**
   * Uppercase first letter
   */
  function ucfirst(string) {
    return string[0].toUpperCase() + string.substr(1);
  }
})(window, 
   window.Model);
/**
 * Define Collection
 */
(function(window, Model, utils, undefined) {
  'use strict';

  Model.Collection = Collection;

  ////////

  /**
   * Collection
   * Collection of Models
   */
  function Collection(ModelConstructor, define) {
    // Model constructor must be a model
    if (!utils.inherits('Model', ModelConstructor)) {
      utils.throw('Constructor must inherit the Model constructor');
    }

    // The constructor and the methods
    var Constructor = null,
        methods     = {},
        virtuals    = {},
        statics     = {},
        Arr         = window.Array.prototype,
        $           = utils.$;

    methods.define  = utils.define;
    methods.on      = utils.on;
    methods.fire    = utils.fire;
    methods.emit    = utils.emit;
    methods.change  = utils.change;
    methods.throw   = utils.throw;

    statics.isCollection = true;
  
    // If define is a callback
    if (utils.isFunction(define)) {
      Constructor = define(construct, methods, virtuals, statics);
    }

    // If Constructor is not a function
    if (!utils.isFunction(Constructor)) {
      // Create a default constructor
      Constructor = function Collection(data) {
        construct(this).load(data);
      };
    }
    
    ////////

    /**
     * Apply array method
     */
    function apply(method, array, args) {
      return Arr[method].apply(array, args || []);
    }

    /**
     * Call array method
     */
    function call(method, array, args) {
      return Arr[method].call(array, args || []);
    }

    /**
     * Construct the object
     * This sets default values for the attributes
     */
    function construct(self) {
      // Create listeners
      $(self).listeners = {};
      return self;
    }

    // Unlike in a Model, we don't want to execute Array's default constructor
    return utils.inherit(window.Array, function() {
      return Constructor;
      // Define prototype
    }, function(proto, Collection) {
      proto.convert   = convertItem;
      proto.load      = loadItems;
      proto.fill      = fillArray;
      proto.filter    = filterData;
      proto.Model     = ModelConstructor;
      proto.push      = pushItem;
      proto.splice    = spliceArray;
      proto.toJson    = toJson;
      proto.toObject  = toObject;
      proto.unshift   = unshiftArray;

      // Extend Constructor
      return utils.extendConstructor(Collection, methods, virtuals, statics);

      ////////

      /**
       * Convert item to Model
       */
      function convertItem(item) {
        // Filter convert
        item = this.filter('convert', item);
        // If not an instance of Constructor
        if (!(item instanceof this.Model)) {
          // Create
          item = new this.Model(item);
        }
        // Set parent
        utils.$(item).parent = this;
        return item;
      }

      /**
       * Override fill
       */
      function fillArray() {
        // If there's first argument
        if (utils.isDefined(arguments[0])) {
          // Convert
          arguments[0] = this.convert(arguments[0]);
        }
        return apply('fill', this, arguments);
      }

      /**
       * Filter
       */
      function filterData(name, data) {
        return data;
      }

      /**
       * Load data
       */
      function loadItems(items) {
        this.length = 0;
        this.push.apply(this, this.filter('load', items));
        return this;
      }

      /**
       * Override push
       */
      function pushItem() {
        var self = this;
        // Push arguments
        return apply('push', this, call('slice', arguments || {}).map(function(arg) {
          return self.convert(arg);
        }));
      }

      /**
       * Override splice
       */
      function spliceArray() {
        // Get args
        var args = call('slice', arguments || {});
        // If length is greater than 2
        if (args.length > 2) {
          var l = args.length,
              i = l - 2;
          while (i--) {
            // Convert each
            args[l - i - 1] = this.convert(args[l - i - 1]);
          }
        }
        return apply('splice', this, args);
      }

      /**
       * To json
       */
      function toJson(exclude, replacer, space) {
        return JSON.stringify(this.toObject(exclude), replacer, space);
      }

      /**
       * To object
       */
      function toObject(exclude) {
        // Map
        return this.map(function(item) {
          return item.toObject(exclude);
        });
      }

      /**
       * Override unshift
       */
      function unshiftArray() {
        // Self
        var self = this;
        // Push arguments
        return apply('unshift', this, call('slice', arguments || {}).map(function(arg) {
          return self.convert(arg);
        }));
      }
    });
  }
})(window, 
   window.Model, 
   window.Model.utils);
/**
 * Model Exception
 */
(function(window, Error, Model, utils, undefined) {
  'use strict';

  Model.Exception = utils.inherit(Error, function(construct) {
    return Exception;

    ////////

    function Exception(message, source) {
      construct(this);
      this.message = message;
      this.source = source;
      this.stack = (new Error()).stack;
    }
  });
  Model.Exception.prototype.throw = throwException;

  ////////

  /**
   * Throw error
   */
  function throwException(message) {
    throw new Model.Exception(message, this);
  }
})(window, 
   window.Error, 
   window.Model, 
   window.Model.utils);
/**
 * Define Schema
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * The Schema
   * Inherit Array
   */
  Model.Schema = utils.inherit(window.Array, function(construct) {
    return Schema;

    // Return Constructor
    function Schema(Constructor, schema, parent, virtuals, options) {
      var i = 0,
          l = 0;
          
      this.Constructor  = Constructor;
      this.parent       = parent || null;
      this.virtuals     = virtuals || [];
      this.options      = options || {};
      this.index        = {};
      this.cache        = {
        mutators: {
          get: {},
          set: {}
        }
      };

      if (this.parent) {
        i = l = this.parent.virtuals.length;
        while (i--) {
          if (this.virtuals.indexOf(this.parent.virtuals[l - i - 1]) < 0) {
            this.virtuals.push(this.parent.virtuals[l - i - 1]);
          }
        }
      }

      if (utils.isDefined(schema)) {
        var keys = window.Object.keys(schema);
        i = l = keys.length;
        while (i--) {
          this.set(keys[l - i - 1], schema[keys[l - i - 1]]);
        }
      }
    }
  }, function(proto, Schema) {
    proto.export  = exportSchema;
    proto.get     = getKey;
    proto.set     = setKey;

    ////////

    /**
     * Export Schema
     */
    function exportSchema(extend) {
      // All keys
      var json = {},
          l = this.length,
          i = l;
      while (i--) {
        json[this[l - i - 1].name] = this[l - i - 1].export();
      }
      return utils.extend(json, extend || {});
    }

    /**
     * Get key
     */
    function getKey(name) {
      // If index is defined
      if (utils.isDefined(this.index[name])) {
        return this[this.index[name]];
      }
      var l = this.length,
          i = l;
      while (i--) {
        if (this[l - i - 1].name === name) {
          // Put into index
          this.index[name] = l - i - 1;
          break;
        }
      }
      return this[this.index[name]];
    }

    /**
     * Set Schema
     * Translate from raw schema
     */
    function setKey(name, definition) {
      var key = new Schema.Key(this, name, definition);
      this.index[key.name] = this.length;
      this.push(key);
    }
  });
})(window, 
   window.Model, 
   window.Model.utils);
/**
 * Define Type
 */
(function(window, Model, utils, undefined) {
  'use strict';

  Model.Schema.Type   = Type;
  Model.Schema.Types  = {};

  Type.prototype.compare  = compareType;
  Type.prototype.inherits = inherits;
  Type.prototype.is       = isType;
  Type.prototype.match    = matchConstructor;

  ////////

  /**
   * Property Type
   */
  function Type(name, Constructor, native) {
    this.Constructor  = Constructor || null;
    this.name         = name;
    this.native       = !!native;
    this.original     = null;
    this.raw          = (name || '').toLowerCase();
  }

  /**
   * Compare
   */
  function compareType(a, b, deep, level) {
    return a - b;
  }

  /**
   * Inherits constructor
   */
  function inherits(Constructor) {
    return utils.isFunction(Constructor) &&
           (this.Constructor === Constructor);
  }
  
  /**
   * Check if a variable is a type or instance of constructor
   */
  function isType(value) {
    // This is to fix typeof null == 'object' (-_-)
    if (value === null) {
      return false;
    }
    var type = ((typeof value) || '').toLowerCase();
    if (type === 'object') {
      // If object, match constructor
      if (value instanceof this.Constructor) {
        return true;
      }
    }
    return (this.raw === type);
  }

  /**
   * Check if constructor matches
   */
  function matchConstructor(check) {
    // If check is instance of Self
    if (check instanceof (this.prototype || this).constructor) {
      return this.match(check.name);
    }
    var match = 'Constructor';
    if (utils.is('String', check)) {
      match = 'name';
    }
    return this[match] === check;
  }
})(window, 
   window.Model, 
   window.Model.utils);
/**
 * Any type
 */
(function(window, Type, Types, utils) {
  'use strict';

  Types.Any           = new Type('Any');
  Types.Any.compare   = compareType;
  Types.Any.inherits  = inherits;
  Types.Any.is        = isType;

  ////////

  /**
   * Compare objects
   */
  function compareType(a, b, deep, level) {
    return false;
  }
  
  /**
   * Inherits constructor
   */
  function inherits(Constructor) {
    return false;
  }

  /**
   * Always return true
   */
  function isType(value) {
    return true;
  }
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);
/**
 * Array type
 */
(function(window, Type, Types, utils) {
  'use strict';

  Types.Array         = new Type('Array', window.Array, true);
  Types.Array.compare = compareType;
  Types.Array.is      = isType;

  ////////

  /**
   * Compare
   */
  function compareType(a, b, deep, level) {
    // If length do not match
    if (a.length !== b.length) {
      // Return
      return true;
    }
    // If deep or no level
    if (deep || !level) {
      var l = a.length,
          i = l;
      while (i--) {
        // Get item
        var aItem = a[l - i - 1],
            bItem = b[l - i - 1];
        // Compare
        if (utils.compare(aItem, bItem, deep, (level || 0) + 1)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if array
   */
  function isType(value) {
    return value && ((value.constructor === window.Array) || (value instanceof window.Array));
  }
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);
/**
 * Boolean type
 */
(function(window, Type, Types) {
  'use strict';

  Types.Boolean = new Type('Boolean', window.Boolean, true);
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);
/**
 * Collection type
 */
(function(window, Collection, Type, Types, utils) {
  'use strict';

  Types.Collection          = new Type('Collection');
  Types.Collection.compare  = compareType;
  Types.Collection.inherits = inherits;
  Types.Collection.is       = isType;

  ////////

  /**
   * Compare objects
   */
  function compareType(a, b, deep, level) {
    // If not the same constructor
    if (a.constructor !== b.constructor) {
      return true;
    }
    // If deep or there's no level
    if (deep || !level) {
      var l = a.length,
          i = l;
      while (i--) {
        // Compare
        if (utils.typeCompare(Types.Model, a[l - i - 1], b[l - i - 1], deep, (level || 0) + 1)) {
          return true;
        }
      }
    }
    return false;
  }
  
  /**
   * Inherits constructor
   */
  function inherits(Constructor) {
    // Check
    return utils.isFunction(Constructor) && !!Constructor.isCollection;
  }
  
  /**
   * Check if Collection
   */
  function isType(value) {
    // If there's isCollection
    return value && 
           value.prototype && 
           value.prototype.constructor &&
           value.prototype.constructor.isCollection;
  }
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

  Types.Date    = new Type('Date', window.Date, true);
  Types.Date.is = isType;

  ////////
  
  /**
   * Check if Date
   */
  function isType(value) {
    // Return
    return value && ((value.constructor === window.Date) || (value instanceof window.Date));
  }
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);
/**
 * Model type
 */
(function(window, Model, Type, Types, utils) {
  'use strict';

  Types.Model           = new Type('Model');
  Types.Model.compare   = compareType;
  Types.Model.inherits  = inherits;
  Types.Model.is        = isType;

  ////////

  /**
   * Compare objects
   */
  function compareType(a, b, deep, level) {
    // If not the same constructor
    if (a.constructor !== b.constructor) {
      // Return
      return true;
    }
    // If deep or there's no level
    if (deep || !level) {
      var l = a.schema.length,
          i = l;
      while (i--) {
        // Set key
        var key = a.schema[l - i - 1];
        // Compare
        if (utils.typeCompare(key.type, a[key.name], b[key.name], deep, (level || 0) + 1)) {
          return true;
        }
      }
    }
    return false;
  }
  
  /**
   * Inherits constructor
   */
  function inherits(Constructor) {
    return utils.isFunction(Constructor) && !!Constructor.isModel;
  }

  /**
   * Check if Model
   */
  function isType(value) {
    // If there's isModel
    return !!value                        && 
           !!value.prototype              && 
           !!value.prototype.constructor  &&
           !!value.prototype.constructor.isModel;
  }
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

  Types.Number = new Type('Number', window.Number, true);
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);
/**
 * Object type
 */
(function(window, Type, Types, utils) {
  'use strict';

  Types.Object          = new Type('Object', window.Object, true);
  Types.Object.compare  = compareType;

  ////////

  /**
   * Compare objects
   */
  function compareType(a, b, deep, level) {
    // Get keys
    var aKeys = utils.keys(a, true),
        bKeys = utils.keys(b, true),
        l = aKeys.length;
    // If not the same
    if (l !== bKeys.length) {
      return true;
    }
    // Compare
    if (deep || !level) {
      var i = l;
      while (i--) {
        // Get key
        var aKey = aKeys[l - i - 1],
            bKey = bKeys[l - i - 1];
        // If not the same key
        if (aKey !== bKey) {
          return true;
        }
        // Compare
        if (utils.compare(aKey, bKey, deep, (level || 0) + 1)) {
          return true;
        }
      }
    }
    return false;
  }
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);
/**
 * Self type
 */
(function(window, Type, Types, utils) {
  'use strict';

  Types.Self          = new Type('Self');
  Types.Self.compare  = compareType;
  Types.Self.is       = isType;

  ////////

  /**
   * Compare objects
   */
  function compareType(a, b, deep, level) {
    return false;
  }
  
  /**
   * Always return false
   */
  function isType(value) {
    return false;
  }
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);
/**
 * String type
 */
(function(window, Type, Types) {
  'use strict';

  Types.String          = new Type('String', window.String, true);
  Types.String.compare  = compareType;

  ////////

  /**
   * Compare
   */
  function compareType(a, b, deep, level) {
    // If less than b
    if (a < b) {
      return -1;
    }
    // If greater
    if (a > b) {
      return 1;
    }
    return 0;
  }
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);
/**
 * Define Key
 */
(function(window, Model, utils, undefined) {
  'use strict';

  var keyAttributes = ['enum'],
      typesKeys = window.Object.keys(Model.Schema.Types);

  // Set Key
  Model.Schema.Key = Key;

  Key.prototype.evaluate    = evaluateKey;
  Key.prototype.export      = exportKey;
  Key.prototype.filter      = filterDefinition;
  Key.prototype.getDefault  = getDefault;
  Key.prototype.hasDefault  = hasDefault;
  Key.prototype.isValidEnum = isValidEnum;
  Key.prototype.throw       = throwException;

  ////////

  /**
   * Schema Key
   */
  function Key(schema, name, definition) {
    // Set definition
    definition = definition || {};

    var i     = 0,
        l     = 0,
        proto = schema.Constructor.prototype,
        type  = definition.type || definition;

    this.schema   = schema;
    this.name     = name;
    this.type     = Model.Schema.Types.Any;
    this.default  = definition.default;
    this.null     = utils.is('Boolean', definition.null) ? definition.null : true;

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
        this.type           = new Model.Schema.Type(type.name, this.schema.Constructor);
        this.type.original  = type;
      } else {
        // Set as the Type
        this.type = type;
      }
    } else {
      i = l = typesKeys.length;
      while (i--) {
        var propType = Model.Schema.Types[typesKeys[l - i - 1]];
        // If native
        if (propType.native && propType.match(type)) {
          // Just set
          this.type = propType;
          // If model or collection
        } else if ((propType.match(Model.Schema.Types.Model)       && utils.inherits('Model', type)) ||
                   (propType.match(Model.Schema.Types.Collection)  && utils.inherits('Collection', type))) {
          // Create new type
          this.type = new Model.Schema.Type(propType.name, type);
        }
      }
    }

    i = l = keyAttributes.length;
    while (i--) {
      // If defined
      if (utils.isDefined(definition[keyAttributes[l - i - 1]])) {
        this.filter(keyAttributes[l - i - 1], definition[keyAttributes[l - i - 1]]);
      }
    }

    // Define property for Model
    utils.define.apply(proto, [name, {
      get: function() {
        return proto.get.apply(this, [name]);
      },
      set: function(value) {
        proto.set.apply(this, [name, value]);
      }
    }]);
  }

  /**
   * Evaluate
   */
  function evaluateKey(value, model) {
    // Has model
    var hasModel  = utils.isDefined(model),
        current   = hasModel ? model.get(this.name) : undefined,
        defined   = utils.isDefined(current) && (current !== null),
        result    = current;
    // Check if null
    if (value === null) {
      // If nullable
      if (!!this.null) {
        return null;
      }
      this.throw('`' + this.name + '` cannot be null', model);
    }
    // Select Type
    switch (this.type.name) {
      case Model.Schema.Types.Model.name:
      case Model.Schema.Types.Collection.name:
      case Model.Schema.Types.Self.name:
          // If value is instance of the given constructor
        if (value instanceof this.type.Constructor) {
          // Just replace
          result = value;
        } else if (defined) {
          current.load(value);
        } else {
          // Create new 
          result = new this.type.Constructor(value);
        }
        break;
      // If date
      case Model.Schema.Types.Date.name:
        result = new this.type.Constructor(value || null);
        break;
      // Array
      case Model.Schema.Types.Array.name:
        // Set value
        value = utils.is('Array', value) ? value : (utils.isDefined(value) ? [value] : []);
        if (defined) {
          current.length = 0;
          current.push.apply(current, value);
        } else {
          result = value;
        }
        break;
      // Any
      case Model.Schema.Types.Any.name:
        result = value;
        break;
      default:
        // If string and there's enum
        if (this.type.match(Model.Schema.Types.String) && utils.is('Array', this.enum)) {
          if (!this.isValidEnum(value)) {
            this.throw('Invalid enum value: ' + value, model);
          }
        }
        result = utils.isDefined(value) ? this.type.Constructor(value) : this.type.Constructor();
        break;
    }
    return result;
  }

  /**
   * Export key
   */
  function exportKey() {
    // Json
    var l = keyAttributes.length,
        i = l, 
        self = this;
    var json = {
      type: this.type.original || this.type
    };
    // If there's default
    if (this.hasDefault()) {
      json.default = this.default;
    }
    while (i--) {
      // If set
      if (utils.isDefined(self[keyAttributes[l - i - 1]])) {
        json[keyAttributes[l - i - 1]] = self[keyAttributes[l - i - 1]];
      }
    }
    return json;
  }

  /**
   * Filter definition
   */
  function filterDefinition(attribute, value) {
    // Select
    switch (attribute) {
      // Enum
      case 'enum':
        // Value must be an array of strings
        var items = utils.is('Array', value) ? value : [value],
            enumerable = [],
            l = items.length,
            i = l;
        while (i--) {
          // Add only if string and not empty
          if (utils.is('String', items[l - i - 1]) && items[l - i - 1].length) {
            enumerable.push(items[l - i - 1]);
          }
        }
        this[attribute] = enumerable;
        if (this.hasDefault()) {
          var defaultValue = this.getDefault();
          if (!this.isValidEnum(defaultValue)) {
            this.throw('Invalid enum default value: ' + defaultValue);
          }
        }
        break;
    }
  }

  /**
   * Get default value
   */
  function getDefault(model) {
    // Execute if method
    return utils.isFunction(this.default) ? 
           this.default.apply(this, utils.isDefined(model) ? [model] : []) :
           this.default;
  }

  /**
   * Has default
   */
  function hasDefault() {
    return utils.isDefined(this.default);
  }

  /**
   * Check if enum is valid
   */
  function isValidEnum(value) {
    return this.enum.indexOf(value) >= 0;
  }

  /**
   * Throw error
   */
  function throwException(message, model) {
    Model.Exception.prototype.throw.apply(model || this, [message]);
  }
})(window, 
   window.Model, 
   window.Model.utils);