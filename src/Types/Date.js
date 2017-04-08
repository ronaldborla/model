/**
 * Date type
 */
(function(window, Type, Types) {
  'use strict';

  Types.Date    = new Type('Date', window.Date, true);
  Types.Date.is = isType;

  ////////
  
  /**
   * Check if Date
   */
  function isType(value) {
    // Return
    return value && ((value.constructor === window.Date) || (value instanceof window.Date));
  }
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);