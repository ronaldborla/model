
/**
 * Define Schema
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * The Schema
   * Inherit Array
   */
  var Schema = utils.inherit(window.Array, function(construct) {
    // Return Constructor
    return function Schema(Constructor, schema, parent, virtuals, options) {
      // Self
      var self = construct(this);

      // This Constructor
      this.Constructor = Constructor;
      // Parent schema
      this.parent = parent || null;
      // The virtuals
      this.virtuals = virtuals || [];
      // The options
      this.options = options || {};
      // Create index
      this.index = {};

      // If there's parent
      if (this.parent) {
        // Inherit virtuals
        this.parent.virtuals.forEach(function(virtual) {
          // Add if not exists
          if (self.virtuals.indexOf(virtual) < 0) {
            // Push
            self.virtuals.push(virtual);
          }
        });
      }

      // If there's schema
      if (utils.isDefined(schema)) {
        // Loop
        utils.forEach(schema, function(definition, name) {
          // Set it
          self.set(name, definition);
        });
      }
    };
    // Define prototype
  }, function(proto, Schema) {

    /**
     * Get schema
     */
    proto.get = function(name) {
      // If index is defined
      if (utils.isDefined(this.index[name])) {
        // Return immediately
        return this[this.index[name]];
      }
      // Find
      for (var i = 0; i < this.length; i++) {
        // Match name
        if (this[i].name === name) {
          // Put into index
          this.index[name] = i;
          break;
        }
      }
      // Return key
      return this[this.index[name]];
    };

    /**
     * Set Schema
     * Translate from raw schema
     */
    proto.set = function(name, definition) {
      // Create key
      var key = new Schema.Key(this, name, definition);
      // Add to index immediately
      this.index[key.name] = this.length;
      // Push translated
      this.push(key);
    };

    /**
     * Export Schema
     */
    proto.export = function(extend) {
      // All keys
      var json = {};
      // Loop through keys
      this.forEach(function(key) {
        // Add to json
        json[key.name] = key.export();
      });
      // Return
      return utils.extend(json, extend || {});
    };

  });

  // Set Schema
  Model.Schema = Schema;

  // Inject window, Model, and utils
})(window, window.Model, window.Model.utils);
