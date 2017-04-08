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