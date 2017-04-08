/**
 * Boolean type
 */
(function(window, Type, Types) {
  'use strict';

  Types.Boolean = new Type('Boolean', window.Boolean, true);
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);