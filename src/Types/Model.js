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
