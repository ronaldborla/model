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