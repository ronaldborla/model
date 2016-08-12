/**
 * String type
 */
(function(window, Type, Types) {
  'use strict';

  /**
   * Create type
   */
  Types.String = new Type('String', window.String, true);

  /**
   * Compare
   */
  Types.String.compare = function(a, b, deep, level) {
    // If less than b
    if (a < b) {
      // Return -1
      return -1;
    }
    // If greater
    if (a > b) {
      // Return 1
      return 1;
    }
    // Return 0
    return 0;
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);
