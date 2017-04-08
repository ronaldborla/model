/**
 * Self type
 */
(function(window, Type, Types, utils) {
  'use strict';

  Types.Self          = new Type('Self');
  Types.Self.compare  = compareType;
  Types.Self.is       = isType;

  ////////

  /**
   * Compare objects
   */
  function compareType(a, b, deep, level) {
    return false;
  }
  
  /**
   * Always return false
   */
  function isType(value) {
    return false;
  }
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);