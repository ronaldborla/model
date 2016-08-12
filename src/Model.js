
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
        if (utils.isDefined(key.default)) {
          // Set default value
          self[key.name] = key.default;
        }
      });
      // Return self
      return self;
    };

    /**
     * Get attribute
     */
    methods.get = function(name) {
      // Return attribute
      return attr(this)[name];
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
          previous = attributes[name];
      // Create
      attributes[name] = key.evaluate(value, this);
      // If result is an object
      if (typeof attributes[name] === 'object') {
        // Set its parent
        utils.$(attributes[name]).parent = this;
      }
      // Call set attribute
      this.fire('setAttribute', [name, attributes[name], previous]);
      // Set specific attribute
      this.fire('set' + utils.ucfirst(name) + 'Attribute', [attributes[name], previous]);
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
      // If there's data
      if (utils.isDefined(data)) {
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
          childSchema = parentSchema.export(extendSchema);
      // Define child
      var defineChild = function(construct, methods, virtuals, statics) {
        // Execute defineModel
        return defineModel(function(self, args) {
          // Apply parent's constructor
          parentSchema.Constructor.apply(self, args);
          // Pass native construct method to 5th param
        }, methods, virtuals, statics, construct);
      };
      // Return Model
      return Model(childSchema, defineChild);
    };

    // If define is a callback
    if (utils.isFunction(define)) {
      // Call define and get the constructor
      Constructor = define(construct, methods, virtuals, statics);
    }

    // If Constructor is not a function
    if (!utils.isFunction(Constructor)) {
      // Create a default constructor
      Constructor = function Model(data) {
        // Do construct and load
        construct(this).load(data);
      };
    }

    // Get the prototype
    var proto = Constructor.prototype;

    /**
     * Extend methods to prototype
     */
    utils.extend(proto, methods);

    // Initialize schema
    proto.schema = new Model.Schema(Constructor, schema);

    /**
     * Define virtuals
     */
    utils.forEach(virtuals, function(method, name) {
      // Define
      methods.define.apply(proto, [name, {
        // Get only since virtuals are read-only
        get: method
      }]);
    });

    /**
     * Extend statics to constructor
     */
    utils.extend(Constructor, statics);

    // Return the constructor
    return Constructor;
  };

  // Return Model
  return Model;

  // Inject window
})(window);
