/**
 * Any type
 */
(function(window, Type, Types, utils) {
  'use strict';

  Types.Any           = new Type('Any');
  Types.Any.compare   = compareType;
  Types.Any.inherits  = inherits;
  Types.Any.is        = isType;

  ////////

  /**
   * Compare objects
   */
  function compareType(a, b, deep, level) {
    return false;
  }
  
  /**
   * Inherits constructor
   */
  function inherits(Constructor) {
    return false;
  }

  /**
   * Always return true
   */
  function isType(value) {
    return true;
  }
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);