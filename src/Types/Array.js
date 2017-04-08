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