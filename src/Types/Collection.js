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
