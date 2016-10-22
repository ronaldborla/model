
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
    // If null
    // This is to fix typeof null == 'object' (-_-)
    if (value === null) {
      // Return false
      return false;
    }
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
