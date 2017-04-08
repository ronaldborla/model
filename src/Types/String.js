/**
 * String type
 */
(function(window, Type, Types) {
  'use strict';

  Types.String          = new Type('String', window.String, true);
  Types.String.compare  = compareType;

  ////////

  /**
   * Compare
   */
  function compareType(a, b, deep, level) {
    // If less than b
    if (a < b) {
      return -1;
    }
    // If greater
    if (a > b) {
      return 1;
    }
    return 0;
  }
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);