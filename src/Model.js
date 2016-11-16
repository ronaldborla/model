
/**
 * Define Model
 */
window.Model = (function(window, undefined) {
  'use strict';

  /**
   * JS Model
   * @param schema The model schema
   * @param define Callback to define the methods 
   * @return The constructor of the new Model
   */
  var Model = function(schema, define) {

    // The constructor and the methods
    var Constructor = null,
        methods = {},
        virtuals = {},
        statics = {},
        options = {},
        utils = Model.utils;

    // Set $
    var $ = utils.$;

    /**
     * Get attr
     */
    var attr = function(self) {
      // Return
      return $(self).attributes;
    };

    /**
     * Construct the object
     * This sets default values for the attributes
     */
    var construct = function(self, args) {
      // Create attributes
      $(self).attributes = {};
      // Create listeners
      $(self).listeners = {};
      // Loop through schema
      self.schema.forEach(function(key) {
        // Only if default is defined
        if (key.hasDefault()) {
          // Set default value
          self[key.name] = key.getDefault(self);
        }
      });
      // Return self
      return self;
    };

    /**
     * Get attribute
     */
    methods.get = function(name) {
      // Get method
      var method = utils.camelCase(['get', name, 'attribute'].join(' ')),
          orig = attr(this)[name];
      // If set
      if (utils.isFunction(this[method])) {
        // Use it
        return this[method].apply(this, [orig]);
        // Otherwise
      } else {
        // Return original
        return orig;
      }
    };

    /**
     * Set attribute
     */
    methods.set = function(name, value) {
      // The key
      var key = this.schema.get(name),
          // This attributes
          attributes = attr(this),
          // Previous
          previous = attributes[name],
          // Method
          method = utils.camelCase(['set', name, 'attribute'].join(' ')),
          // Evaluate
          evaluated = key.evaluate(value, this);
      // If method is set
      if (utils.isFunction(this[method])) {
        // Use it
        attributes[name] = this[method].apply(this, [evaluated, previous]);
      } else {
        // Set directly
        attributes[name] = evaluated;
      }
      // If result is an object
      if (attributes[name] && typeof attributes[name] === 'object') {
        // Set its parent
        utils.$(attributes[name]).parent = this;
      }
      // Call set attribute
      this.fire('setAttribute', [name, attributes[name], previous]);
      // Set specific attribute
      this.fire(method, [attributes[name], previous]);
      // If changed
      if (utils.typeCompare(key.type, attributes[name], previous)) {
        // Change
        this.change();
      }
      // Return self
      return this;
    };

    // Set define
    methods.define = utils.define;
    // Set on
    methods.on = utils.on;
    // Set fire
    methods.fire = utils.fire;
    // Set emit
    methods.emit = utils.emit;
    // Set change
    methods.change = utils.change;
    // Set throw
    methods.throw = utils.throw;

    /**
     * Load data
     * @param data The data to load
     */
    methods.load = function(data) {
      // The object
      var self = this;
      // Call filter
      data = this.filter('load', data);
      // If there's data
      if (utils.isDefined(data)) {
        // Before load
        this.fire('beforeload', [data]);
        // Loop through schema
        this.schema.forEach(function(key) {
          // If data is defined
          if (utils.isDefined(data[key.name])) {
            // Set data
            self[key.name] = data[key.name];
          }
        });
        // Call load
        this.fire('load');
      }
      // Return self
      return this;
    };

    /**
     * Filter
     */
    methods.filter = function(name, data) {
      // Return data
      return data;
    };

    /**
     * To object
     */
    methods.toObject = function(exclude) {
      // The object
      var self = this,
          object = {};
      // If defined
      if (utils.isDefined(exclude)) {
        // If string
        if (utils.is('String', exclude)) {
          // Put in array
          exclude = [exclude];
        }
        // If array
        if (utils.is('Array', exclude)) {
          // Convert
          exclude = utils.arrayOfStringsToObject(exclude);
        }
      } else {
        // Default to object
        exclude = {};
      }
      // If exclude is not object
      if (!utils.is('Object', exclude)) {
        // Error
        this.throw('`exclude` must be an object or an array of strings');
      }
      // Register value
      var registerValue = function(key) {
        // Key name
        var keyName = key.name || key;
        // Must not be excluded
        if (exclude[keyName] !== true) {
          // Get value
          var exportMethod = utils.camelCase(['export', keyName, 'attribute'].join(' ')),
              // Check if there's an export method
              value = utils.isFunction(self[exportMethod]) ?
                      // Use the one defined in the method
                      self[exportMethod].apply(self, [self[keyName]]) :
                      // Use as is
                      self[keyName],
              // If there's a toObject method
              hasToObject = value && utils.isFunction(value.toObject);
          // If no toObject but object
          if (!hasToObject && utils.is('Object', value)) {
            // If date
            if (utils.is('Date', value)) {
              // Convert to string
              value = value.toString();
            } else {
              // Clean
              value = utils.cleanObject(value);
            }
          }
          // Set it
          object[keyName] = hasToObject ? value.toObject(exclude[keyName]) : value;
        }
      };
      // Loop through schema
      this.schema.forEach(registerValue);
      // Loop through virtuals
      this.schema.virtuals.forEach(registerValue);
      // Call filter
      object = this.filter('export', object);
      // Export callback
      this.fire('export', [object, exclude]);
      // Return
      return object;
    };

    /**
     * To json
     */
    methods.toJson = function(exclude, replacer, space) {
      // Return stringified
      return JSON.stringify(this.toObject(exclude), replacer, space);
    };

    /**
     * Constructor is a Model
     */
    statics.isModel = true;

    /**
     * Inherit the Model
     */
    statics.inherit = function(extendSchema, defineModel) {
      // Parent schema
      var parentSchema = this.prototype.schema,
          // The child schema
          childSchema = parentSchema.export(extendSchema),
          // Define methods
          methods = {},
          virtuals = {},
          statics = {},
          options = parentSchema.options || {};
      // Inherit
      return utils.inherit(parentSchema.Constructor, function(construct) {
        // Use defineModel
        return defineModel(construct, methods, virtuals, statics, options);
        // Define prototype
      }, function(proto, Constructor) {
        // Override schema
        proto.schema = new Model.Schema(Constructor, 
                                        childSchema, 
                                        parentSchema, 
                                        utils.keys(virtuals || {}),
                                        options);
        // Extend
        return utils.extendConstructor(Constructor, methods, virtuals, statics);
      });
    };

    // If define is a callback
    if (utils.isFunction(define)) {
      // Call define and get the constructor
      Constructor = define(construct, methods, virtuals, statics, options);
    }

    // If Constructor is not a function
    if (!utils.isFunction(Constructor)) {
      // Create a default constructor
      Constructor = function Model(data) {
        // Do construct and load
        construct(this).load(data);
      };
    }

    // Initialize schema
    Constructor.prototype.schema = new Model.Schema(Constructor, 
                                                    schema, 
                                                    null, 
                                                    utils.keys(virtuals || {}),
                                                    options);

    // Extend and return Constructor 
    return utils.extendConstructor(Constructor, methods, virtuals, statics);
  };

  // Return Model
  return Model;

  // Inject window
})(window);
