/**
 * Any type
 */
(function(window, Type, Types, utils) {
  'use strict';

  /**
   * Create type
   */
  Types.Any = new Type('Any');

  /**
   * Compare objects
   */
  Types.Any.compare = function(a, b, deep, level) {
    // Return
    return false;
  };

  /**
   * Always return true
   */
  Types.Any.is = function(value) {
    // Return true
    return true;
  };
  
  /**
   * Inherits constructor
   */
  Types.Any.inherits = function(Constructor) {
    // Check
    return false;
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);
