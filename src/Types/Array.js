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
