
/**
 * Define Collection
 */
(function(window, Model, utils, undefined) {
  'use strict';

  /**
   * Collection
   * Collection of Models
   */
  var Collection = function(ModelConstructor, define) {
    // Model constructor must be a model
    if (!utils.inherits('Model', ModelConstructor)) {
      // Throw error
      utils.throw('Constructor must inherit the Model constructor');
    }

    // The constructor and the methods
    var Constructor = null,
        methods = {},
        virtuals = {},
        statics = {},
        Arr = window.Array.prototype,
        call = function(method, array, args) {
          // Return
          return Arr[method].call(array, args || []);
        },
        apply = function(method, array, args) {
          // Return
          return Arr[method].apply(array, args || []);
        };

    // Set $
    var $ = utils.$;

    /**
     * Construct the object
     * This sets default values for the attributes
     */
    var construct = function(self) {
      // Create listeners
      $(self).listeners = {};
      // Return self
      return self;
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

    // If define is a callback
    if (utils.isFunction(define)) {
      // Call define and get the constructor
      Constructor = define(construct, methods, virtuals, statics);
    }

    // If Constructor is not a function
    if (!utils.isFunction(Constructor)) {
      // Create a default constructor
      Constructor = function Collection(data) {
        // Do construct and load
        construct(this).load(data);
      };
    }

    /**
     * Constructor is a collection
     */
    Constructor.isCollection = true;

    // Unlike in a Model, we don't want to execute Array's default constructor
    return utils.inherit(window.Array, function() {
      // Return Constructor
      return Constructor;
      // Define prototype
    }, function(proto, Collection) {

      /**
       * Set ModelConstructor
       */
      proto.Model = ModelConstructor;

      /**
       * Convert item to Model
       */
      proto.convert = function(item) {
        // If not an instance of Constructor
        if (!(item instanceof this.Model)) {
          // Create
          item = new this.Model(item);
        }
        // Set parent
        utils.$(item).parent = this;
        // Return item
        return item;
      };

      /**
       * Load data
       */
      proto.load = function(items) {
        // Empty first
        this.length = 0;
        // Push data
        this.push.apply(this, items);
        // Return self
        return this;
      };

      /**
       * Override push
       */
      proto.push = function() {
        // Self
        var self = this;
        // Push arguments
        return apply('push', this, call('slice', arguments || {}).map(function(arg) {
          // Return
          return self.convert(arg);
        }));
      };

      /**
       * Override fill
       */
      proto.fill = function() {
        // If there's first argument
        if (utils.isDefined(arguments[0])) {
          // Convert
          arguments[0] = this.convert(arguments[0]);
        }
        // Apply
        return apply('fill', this, arguments);
      };

      /**
       * Override splice
       */
      proto.splice = function() {
        // Get args
        var args = call('slice', arguments || {});
        // If length is greater than 2
        if (args.length > 2) {
          // Loop through args
          for (var i = 2; i < args.length; i++) {
            // Convert each
            args[i] = this.convert(args[i]);
          }
        }
        // Return
        return apply('splice', this, args);
      };

      /**
       * Override unshift
       */
      proto.unshift = function() {
        // Self
        var self = this;
        // Push arguments
        return apply('unshift', this, call('slice', arguments || {}).map(function(arg) {
          // Return
          return self.convert(arg);
        }));
      };

      /**
       * Extend methods to prototype
       */
      utils.extend(proto, methods);

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
      utils.extend(Collection, statics);

    });
  };

  // Set Collection
  Model.Collection = Collection;

  // Inject window, Model, and utils
})(window, window.Model, window.Model.utils);
