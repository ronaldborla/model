/**
 * Define Key
 */
(function(window, Model, utils, undefined) {
  'use strict';

  var keyAttributes = ['enum'],
      typesKeys = window.Object.keys(Model.Schema.Types);

  // Set Key
  Model.Schema.Key = Key;

  Key.prototype.evaluate    = evaluateKey;
  Key.prototype.export      = exportKey;
  Key.prototype.filter      = filterDefinition;
  Key.prototype.getDefault  = getDefault;
  Key.prototype.hasDefault  = hasDefault;
  Key.prototype.isValidEnum = isValidEnum;
  Key.prototype.throw       = throwException;

  ////////

  /**
   * Schema Key
   */
  function Key(schema, name, definition) {
    // Set definition
    definition = definition || {};

    var i     = 0,
        l     = 0,
        proto = schema.Constructor.prototype,
        type  = definition.type || definition;

    this.schema   = schema;
    this.name     = name;
    this.type     = Model.Schema.Types.Any;
    this.default  = definition.default;
    this.null     = utils.is('Boolean', definition.null) ? definition.null : true;

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
        this.type           = new Model.Schema.Type(type.name, this.schema.Constructor);
        this.type.original  = type;
      } else {
        // Set as the Type
        this.type = type;
      }
    } else {
      i = l = typesKeys.length;
      while (i--) {
        var propType = Model.Schema.Types[typesKeys[l - i - 1]];
        // If native
        if (propType.native && propType.match(type)) {
          // Just set
          this.type = propType;
          // If model or collection
        } else if ((propType.match(Model.Schema.Types.Model)       && utils.inherits('Model', type)) ||
                   (propType.match(Model.Schema.Types.Collection)  && utils.inherits('Collection', type))) {
          // Create new type
          this.type = new Model.Schema.Type(propType.name, type);
        }
      }
    }

    i = l = keyAttributes.length;
    while (i--) {
      // If defined
      if (utils.isDefined(definition[keyAttributes[l - i - 1]])) {
        this.filter(keyAttributes[l - i - 1], definition[keyAttributes[l - i - 1]]);
      }
    }

    // Define property for Model
    utils.define.apply(proto, [name, {
      get: function() {
        return proto.get.apply(this, [name]);
      },
      set: function(value) {
        proto.set.apply(this, [name, value]);
      }
    }]);
  }

  /**
   * Evaluate
   */
  function evaluateKey(value, model) {
    // Has model
    var hasModel  = utils.isDefined(model),
        current   = hasModel ? model.get(this.name) : undefined,
        defined   = utils.isDefined(current) && (current !== null),
        result    = current;
    // Check if null
    if (value === null) {
      // If nullable
      if (!!this.null) {
        return null;
      }
      this.throw('`' + this.name + '` cannot be null', model);
    }
    // Select Type
    switch (this.type.name) {
      case Model.Schema.Types.Model.name:
      case Model.Schema.Types.Collection.name:
      case Model.Schema.Types.Self.name:
          // If value is instance of the given constructor
        if (value instanceof this.type.Constructor) {
          // Just replace
          result = value;
        } else if (defined) {
          current.load(value);
        } else {
          // Create new 
          result = new this.type.Constructor(value);
        }
        break;
      // If date
      case Model.Schema.Types.Date.name:
        result = new this.type.Constructor(value || null);
        break;
      // Array
      case Model.Schema.Types.Array.name:
        // Set value
        value = utils.is('Array', value) ? value : (utils.isDefined(value) ? [value] : []);
        if (defined) {
          current.length = 0;
          current.push.apply(current, value);
        } else {
          result = value;
        }
        break;
      // Any
      case Model.Schema.Types.Any.name:
        result = value;
        break;
      default:
        // If string and there's enum
        if (this.type.match(Model.Schema.Types.String) && utils.is('Array', this.enum)) {
          if (!this.isValidEnum(value)) {
            this.throw('Invalid enum value: ' + value, model);
          }
        }
        result = utils.isDefined(value) ? this.type.Constructor(value) : this.type.Constructor();
        break;
    }
    return result;
  }

  /**
   * Export key
   */
  function exportKey() {
    // Json
    var l = keyAttributes.length,
        i = l, 
        self = this;
    var json = {
      type: this.type.original || this.type
    };
    // If there's default
    if (this.hasDefault()) {
      json.default = this.default;
    }
    while (i--) {
      // If set
      if (utils.isDefined(self[keyAttributes[l - i - 1]])) {
        json[keyAttributes[l - i - 1]] = self[keyAttributes[l - i - 1]];
      }
    }
    return json;
  }

  /**
   * Filter definition
   */
  function filterDefinition(attribute, value) {
    // Select
    switch (attribute) {
      // Enum
      case 'enum':
        // Value must be an array of strings
        var items = utils.is('Array', value) ? value : [value],
            enumerable = [],
            l = items.length,
            i = l;
        while (i--) {
          // Add only if string and not empty
          if (utils.is('String', items[l - i - 1]) && items[l - i - 1].length) {
            enumerable.push(items[l - i - 1]);
          }
        }
        this[attribute] = enumerable;
        if (this.hasDefault()) {
          var defaultValue = this.getDefault();
          if (!this.isValidEnum(defaultValue)) {
            this.throw('Invalid enum default value: ' + defaultValue);
          }
        }
        break;
    }
  }

  /**
   * Get default value
   */
  function getDefault(model) {
    // Execute if method
    return utils.isFunction(this.default) ? 
           this.default.apply(this, utils.isDefined(model) ? [model] : []) :
           this.default;
  }

  /**
   * Has default
   */
  function hasDefault() {
    return utils.isDefined(this.default);
  }

  /**
   * Check if enum is valid
   */
  function isValidEnum(value) {
    return this.enum.indexOf(value) >= 0;
  }

  /**
   * Throw error
   */
  function throwException(message, model) {
    Model.Exception.prototype.throw.apply(model || this, [message]);
  }
})(window, 
   window.Model, 
   window.Model.utils);