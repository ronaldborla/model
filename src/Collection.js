/**
 * Define Collection
 */
(function(window, Model, utils, undefined) {
  'use strict';

  Model.Collection = Collection;

  ////////

  /**
   * Collection
   * Collection of Models
   */
  function Collection(ModelConstructor, define) {
    // Model constructor must be a model
    if (!utils.inherits('Model', ModelConstructor)) {
      utils.throw('Constructor must inherit the Model constructor');
    }

    // The constructor and the methods
    var Constructor = null,
        methods     = {},
        virtuals    = {},
        statics     = {},
        Arr         = window.Array.prototype,
        $           = utils.$;

    methods.define  = utils.define;
    methods.on      = utils.on;
    methods.fire    = utils.fire;
    methods.emit    = utils.emit;
    methods.change  = utils.change;
    methods.throw   = utils.throw;

    statics.isCollection = true;
  
    // If define is a callback
    if (utils.isFunction(define)) {
      Constructor = define(construct, methods, virtuals, statics);
    }

    // If Constructor is not a function
    if (!utils.isFunction(Constructor)) {
      // Create a default constructor
      Constructor = function Collection(data) {
        construct(this).load(data);
      };
    }
    
    ////////

    /**
     * Apply array method
     */
    function apply(method, array, args) {
      return Arr[method].apply(array, args || []);
    }

    /**
     * Call array method
     */
    function call(method, array, args) {
      return Arr[method].call(array, args || []);
    }

    /**
     * Construct the object
     * This sets default values for the attributes
     */
    function construct(self) {
      // Create listeners
      $(self).listeners = {};
      return self;
    }

    // Unlike in a Model, we don't want to execute Array's default constructor
    return utils.inherit(window.Array, function() {
      return Constructor;
      // Define prototype
    }, function(proto, Collection) {
      proto.convert   = convertItem;
      proto.load      = loadItems;
      proto.fill      = fillArray;
      proto.filter    = filterData;
      proto.Model     = ModelConstructor;
      proto.push      = pushItem;
      proto.splice    = spliceArray;
      proto.toJson    = toJson;
      proto.toObject  = toObject;
      proto.unshift   = unshiftArray;

      // Extend Constructor
      return utils.extendConstructor(Collection, methods, virtuals, statics);

      ////////

      /**
       * Convert item to Model
       */
      function convertItem(item) {
        // Filter convert
        item = this.filter('convert', item);
        // If not an instance of Constructor
        if (!(item instanceof this.Model)) {
          // Create
          item = new this.Model(item);
        }
        // Set parent
        utils.$(item).parent = this;
        return item;
      }

      /**
       * Override fill
       */
      function fillArray() {
        // If there's first argument
        if (utils.isDefined(arguments[0])) {
          // Convert
          arguments[0] = this.convert(arguments[0]);
        }
        return apply('fill', this, arguments);
      }

      /**
       * Filter
       */
      function filterData(name, data) {
        return data;
      }

      /**
       * Load data
       */
      function loadItems(items) {
        this.length = 0;
        this.push.apply(this, items);
        return this;
      }

      /**
       * Override push
       */
      function pushItem() {
        var self = this;
        // Push arguments
        return apply('push', this, call('slice', arguments || {}).map(function(arg) {
          return self.convert(arg);
        }));
      }

      /**
       * Override splice
       */
      function spliceArray() {
        // Get args
        var args = call('slice', arguments || {});
        // If length is greater than 2
        if (args.length > 2) {
          var l = args.length,
              i = l - 2;
          while (i--) {
            // Convert each
            args[l - i - 1] = this.convert(args[l - i - 1]);
          }
        }
        return apply('splice', this, args);
      }

      /**
       * To json
       */
      function toJson(exclude, replacer, space) {
        return JSON.stringify(this.toObject(exclude), replacer, space);
      }

      /**
       * To object
       */
      function toObject(exclude) {
        // Map
        return this.map(function(item) {
          return item.toObject(exclude);
        });
      }

      /**
       * Override unshift
       */
      function unshiftArray() {
        // Self
        var self = this;
        // Push arguments
        return apply('unshift', this, call('slice', arguments || {}).map(function(arg) {
          return self.convert(arg);
        }));
      }
    });
  }
})(window, 
   window.Model, 
   window.Model.utils);