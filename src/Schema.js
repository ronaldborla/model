/**
 * Define Schema
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * The Schema
   * Inherit Array
   */
  Model.Schema = utils.inherit(window.Array, function(construct) {
    return Schema;

    // Return Constructor
    function Schema(Constructor, schema, parent, virtuals, options) {
      var i = 0,
          l = 0;
          
      this.Constructor  = Constructor;
      this.parent       = parent || null;
      this.virtuals     = virtuals || [];
      this.options      = options || {};
      this.index        = {};
      this.cache        = {
        mutators: {
          get: {},
          set: {}
        }
      };

      if (this.parent) {
        i = l = this.parent.virtuals.length;
        while (i--) {
          if (this.virtuals.indexOf(this.parent.virtuals[l - i - 1]) < 0) {
            this.virtuals.push(this.parent.virtuals[l - i - 1]);
          }
        }
      }

      if (utils.isDefined(schema)) {
        var keys = window.Object.keys(schema);
        i = l = keys.length;
        while (i--) {
          this.set(keys[l - i - 1], schema[keys[l - i - 1]]);
        }
      }
    }
  }, function(proto, Schema) {
    proto.export  = exportSchema;
    proto.get     = getKey;
    proto.set     = setKey;

    ////////

    /**
     * Export Schema
     */
    function exportSchema(extend) {
      // All keys
      var json = {},
          l = this.length,
          i = l;
      while (i--) {
        json[this[l - i - 1].name] = this[l - i - 1].export();
      }
      return utils.extend(json, extend || {});
    }

    /**
     * Get key
     */
    function getKey(name) {
      // If index is defined
      if (utils.isDefined(this.index[name])) {
        return this[this.index[name]];
      }
      var l = this.length,
          i = l;
      while (i--) {
        if (this[l - i - 1].name === name) {
          // Put into index
          this.index[name] = l - i - 1;
          break;
        }
      }
      return this[this.index[name]];
    }

    /**
     * Set Schema
     * Translate from raw schema
     */
    function setKey(name, definition) {
      var key = new Schema.Key(this, name, definition);
      this.index[key.name] = this.length;
      this.push(key);
    }
  });
})(window, 
   window.Model, 
   window.Model.utils);