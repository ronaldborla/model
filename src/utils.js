
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
