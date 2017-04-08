/**
 * Model type
 */
(function(window, Model, Type, Types, utils) {
  'use strict';

  Types.Model           = new Type('Model');
  Types.Model.compare   = compareType;
  Types.Model.inherits  = inherits;
  Types.Model.is        = isType;

  ////////

  /**
   * Compare objects
   */
  function compareType(a, b, deep, level) {
    // If not the same constructor
    if (a.constructor !== b.constructor) {
      // Return
      return true;
    }
    // If deep or there's no level
    if (deep || !level) {
      var l = a.schema.length,
          i = l;
      while (i--) {
        // Set key
        var key = a.schema[l - i - 1];
        // Compare
        if (utils.typeCompare(key.type, a[key.name], b[key.name], deep, (level || 0) + 1)) {
          return true;
        }
      }
    }
    return false;
  }
  
  /**
   * Inherits constructor
   */
  function inherits(Constructor) {
    return utils.isFunction(Constructor) && !!Constructor.isModel;
  }

  /**
   * Check if Model
   */
  function isType(value) {
    // If there's isModel
    return !!value                        && 
           !!value.prototype              && 
           !!value.prototype.constructor  &&
           !!value.prototype.constructor.isModel;
  }
})(window, 
   window.Model, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types, 
   window.Model.utils);