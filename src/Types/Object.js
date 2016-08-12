/**
 * Object type
 */
(function(window, Type, Types, utils) {
  'use strict';

  /**
   * Create type
   */
  Types.Object = new Type('Object', window.Object, true);

  /**
   * Compare objects
   */
  Types.Object.compare = function(a, b, deep, level) {
    // Get keys
    var aKeys = utils.keys(a, true),
        bKeys = utils.keys(b, true);
    // If not the same
    if (aKeys.length !== bKeys.length) {
      // Return
      return true;
    }
    // Compare
    if (deep || !level) {
      // Loop
      for (var i = 0; i < aKeys.length; i++) {
        // Get key
        var aKey = aKeys[i],
            bKey = bKeys[i];
        // If not the same key
        if (aKey !== bKey) {
          // Return
          return true;
        }
        // Compare
        if (utils.compare(aKey, bKey, deep, (level || 0) + 1)) {
          // Return true
          return true;
        }
      }
    }
    // Return false by default
    return false;
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);
