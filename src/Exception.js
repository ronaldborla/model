
/**
 * Define Exception
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * The Exception
   */
  var Exception = utils.inherit(window.Error, function(construct) {
    // Return Constructor
    return function Exception(message, source) {
      // Construct
      var self = construct(this);

      // Set message
      this.message = message;
      // Set source
      this.source = source;
      // Set stack
      this.stack = (new Error()).stack;
    };
  });

  /**
   * Throw error
   */
  Exception.prototype.throw = function(message) {
    // Throw error
    throw new Exception(message, this);
  };

  // Set Exception
  Model.Exception = Exception;

  // Inject Model
})(window, window.Model, window.Model.utils);
