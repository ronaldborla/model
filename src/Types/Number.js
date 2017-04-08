/**
 * Number type
 */
(function(window, Type, Types) {
  'use strict';

  Types.Number = new Type('Number', window.Number, true);
})(window, 
   window.Model.Schema.Type, 
   window.Model.Schema.Types);