/**
 * Model Exception
 */
(function(window, Error, Model, utils, undefined) {
  'use strict';

  Model.Exception = utils.inherit(Error, function(construct) {
    return Exception;

    ////////

    function Exception(message, source) {
      construct(this);
      this.message = message;
      this.source = source;
      this.stack = (new Error()).stack;
    }
  });
  Model.Exception.prototype.throw = throwException;

  ////////

  /**
   * Throw error
   */
  function throwException(message) {
    throw new Model.Exception(message, this);
  }
})(window, 
   window.Error, 
   window.Model, 
   window.Model.utils);