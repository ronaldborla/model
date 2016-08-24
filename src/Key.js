
/**
 * Define Key
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * Key attributes
   */
  var keyAttributes = ['enum'];

  /**
   * Schema Key
   */
  var Key = function(schema, name, definition) {
    // Self
    var self = this;

    // Set definition
    definition = definition || {};

    // Set schema
    this.schema = schema;
    // Set name
    this.name = name;
    // Set type
    this.type = Model.Schema.Types.Any;
    // Se default
    this.default = definition.default;

    // The translated
    var type = definition.type || definition;
    
    // If type is a string
    if (utils.is('String', type)) {
      // Get from Types
      type = Model.Schema.Types[type];
    }

    // If instance of Type
    if (type instanceof Model.Schema.Type) {
      // If type is self
      if (type.match('Self')) {
        // Create new based on self
        this.type = new Model.Schema.Type(type.name, this.schema.Constructor);
        // Set original
        this.type.original = type;
        // Otherwise
      } else {
        // Set as the Type
        this.type = type;
      }
      // Otherwise
    } else {
      // Loop through types
      utils.forEach(Model.Schema.Types, function(propType) {
        // If native
        if (propType.native && propType.match(type)) {
          // Just set
          self.type = propType;
          // Return false
          return false;
          // If model or collection
        } else if ((propType.match(Model.Schema.Types.Model)       && utils.inherits('Model', type)) ||
                   (propType.match(Model.Schema.Types.Collection)  && utils.inherits('Collection', type))) {
          // Create new type
          self.type = new Model.Schema.Type(propType.name, type);
          // Return false
          return false;
        }
      });
    }

    // Keep other attributes
    keyAttributes.forEach(function(attribute) {
      // If defined
      if (utils.isDefined(definition[attribute])) {
        // Set it
        self.filter(attribute, definition[attribute]);
      }
    });

    // The schema Constructor's prototype
    var proto = schema.Constructor.prototype;

    // Define property for Model
    proto.define.apply(proto, [name, {
      // Get the property
      get: function() {
        // Use get
        return proto.get.apply(this, [name]);
      },
      // Set the property
      set: function(value) {
        // Use set
        proto.set.apply(this, [name, value]);
      }
    }]);
  };

  /**
   * Evaluate
   */
  Key.prototype.evaluate = function(value, model) {
    // Has model
    var hasModel = utils.isDefined(model),
        // Current value
        current = hasModel ? model.get(this.name) : undefined,
        // Is defined
        defined = utils.isDefined(current),
        // Result
        result = current;
    // Select Type
    switch (this.type.name) {
      // Model
      case Model.Schema.Types.Model.name:
      // Collection
      case Model.Schema.Types.Collection.name:
      // Or self
      case Model.Schema.Types.Self.name:
        // If defined
        if (defined) {
          // Load
          current.load(value);
          // If value is instance of the given constructor
        } else if (value instanceof this.type.Constructor) {
          // Just replace
          result = value;
          // Otherwise
        } else {
          // Create new 
          result = new this.type.Constructor(value);
        }
        break;
      // If date
      case Model.Schema.Types.Date.name:
        // Initialize
        result = new this.type.Constructor(value || null);
        break;
      // Array
      case Model.Schema.Types.Array.name:
        // Set value
        value = utils.is('Array', value) ? value : (utils.isDefined(value) ? [value] : []);
        // If defined
        if (defined) {
          // Empty first
          current.length = 0;
          // Push
          current.push.apply(current, value);
          // Otherwise
        } else {
          // Set it
          result = value;
        }
        break;
      // Any
      case Model.Schema.Types.Any.name:
        // Set normally
        result = value;
        break;
      // Else
      default:
        // If string and there's enum
        if (this.type.match(Model.Schema.Types.String) && utils.is('Array', this.enum)) {
          // If not valid enum
          if (!this.isValidEnum(value)) {
            // Throw error
            this.throw('Invalid enum value: ' + value, model);
          }
        }
        // Set normally
        result = utils.isDefined(value) ? this.type.Constructor(value) : this.type.Constructor();
        break;
    }
    // Return result
    return result;
  };

  /**
   * Has default
   */
  Key.prototype.hasDefault = function() {
    // Return
    return utils.isDefined(this.default);
  };

  /**
   * Get default value
   */
  Key.prototype.getDefault = function(model) {
    // Execute if method
    return utils.isFunction(this.default) ? 
           // Call method
           this.default.apply(this, utils.isDefined(model) ? [model] : []) :
           // Return as is
           this.default;
  };

  /**
   * Enum
   */
  Key.prototype.isValidEnum = function(value) {
    // Return
    return this.enum.indexOf(value) >= 0;
  };

  /**
   * Filter definition
   */
  Key.prototype.filter = function(attribute, value) {
    // Select
    switch (attribute) {
      // Enum
      case 'enum':
        // Value must be an array of strings
        var items = utils.is('Array', value) ? value : [value],
            enumerable = [];
        // Loop
        items.forEach(function(item) {
          // Add only if string and not empty
          if (utils.is('String', item) && item.length) {
            // Push to enum
            enumerable.push(item);
          }
        });
        // Set enumerable
        this[attribute] = enumerable;
        // If there's default
        if (this.hasDefault()) {
          // Get default value
          var defaultValue = this.getDefault();
          // If not valid enum
          if (!this.isValidEnum(defaultValue)) {
            // Throw
            this.throw('Invalid enum default value: ' + this.default);
          }
        }
        break;
    }
  };

  /**
   * Throw error
   */
  Key.prototype.throw = function(message, model) {
    // Do throw
    Model.Exception.prototype.throw.apply(model || this, [message]);
  };

  /**
   * Export key
   */
  Key.prototype.export = function() {
    // Json
    var self = this, json = {
      type: this.type.original || this.type
    };
    // If there's default
    if (this.hasDefault()) {
      // Add
      json.default = this.default;
    }
    // Loop through attributes
    keyAttributes.forEach(function(attribute) {
      // If set
      if (utils.isDefined(self[attribute])) {
        // Add
        json[attribute] = self[attribute];
      }
    });
    // Return
    return json;
  };

  // Set Key
  Model.Schema.Key = Key;

  // Inject window, Model, and utils
})(window, window.Model, window.Model.utils);
