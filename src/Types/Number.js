/**
 * Number type
 */
(function(window, Type, Types) {
  'use strict';

  /**
   * Create type
   */
  Types.Number = new Type('Number', window.Number, true);
  
  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);
