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
    utils.extend(Constructor, statics, ['$cache']);
    return Constructor;
  }

  /**
   * Extend object
   */
  function extendObject(left, right, ignore) {
    utils.forEach(right, function(value, name) {
      if (!ignore || ignore.indexOf(name) < 0) {
        left[name] = value;
      }
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