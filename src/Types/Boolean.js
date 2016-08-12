/**
 * Boolean type
 */
(function(window, Type, Types) {
  'use strict';

  /**
   * Create type
   */
  Types.Boolean = new Type('Boolean', window.Boolean, true);

  // Inject
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);
