/**
 * Self type
 */
(function(window, Type, Types, utils) {
  'use strict';

  /**
   * Create type
   */
  Types.Self = new Type('Self');

  /**
   * Compare objects
   */
  Types.Self.compare = function(a, b, deep, level) {
    // Return
    return false;
  };
  
  /**
   * Always return false
   */
  Types.Any.is = function(value) {
    // Return false
    return false;
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);
