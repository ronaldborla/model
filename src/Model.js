
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
      if (attributes[name] && typeof attributes[name] === 'object') {
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
          childSchema = parentSchema.export(extendSchema),
          // Define methods
          methods = {},
          virtuals = {},
          statics = {};
      // Inherit
      return utils.inherit(parentSchema.Constructor, function(construct) {
        // Use defineModel
        return defineModel(construct, methods, virtuals, statics);
        // Define prototype
      }, function(proto, Constructor) {
        // Override schema
        proto.schema = new Model.Schema(Constructor, childSchema, parentSchema);
        // Extend
        return utils.extendConstructor(Constructor, methods, virtuals, statics);
      });
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

    // Initialize schema
    Constructor.prototype.schema = new Model.Schema(Constructor, schema);

    // Extend and return Constructor 
    return utils.extendConstructor(Constructor, methods, virtuals, statics);
  };

  // Return Model
  return Model;

  // Inject window
})(window);
