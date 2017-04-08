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