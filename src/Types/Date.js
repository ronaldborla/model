/**
 * Date type
 */
(function(window, Type, Types) {
  'use strict';

  /**
   * Create type
   */
  Types.Date = new Type('Date', window.Date, true);
  
  /**
   * Check if Date
   */
  Types.Date.is = function(value) {
    // Return
    return value && (value.constructor === window.Date);
  };
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);
