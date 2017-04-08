/**
 * Define Model
 */
(function(window, undefined) {
  'use strict';

  window.Model = Model;

  ////////

  /**
   * JS Model
   * @param schema The model schema
   * @param define Callback to define the methods 
   * @return The constructor of the new Model
   */
  function Model(schema, define) {
    var $           = Model.utils.$,
        Constructor = null,
        methods     = {},
        options     = {},
        statics     = {},
        utils       = Model.utils,
        virtuals    = {};

    methods.change    = utils.change;
    methods.define    = utils.define;
    methods.emit      = utils.emit;
    methods.filter    = filterData;
    methods.fire      = utils.fire;
    methods.get       = getAttribute;
    methods.load      = loadData;
    methods.on        = utils.on;
    methods.set       = setAttribute;
    methods.throw     = utils.throw;
    methods.toJson    = toJson;
    methods.toObject  = toObject;

    statics.inherit   = inherit;
    statics.isModel   = true;

    if (utils.isFunction(define)) {
      Constructor = define(construct, methods, virtuals, statics, options);
    }

    if (!utils.isFunction(Constructor)) {
      // Create a default constructor
      Constructor = function Model(data) {
        construct(this).load(data);
      };
    }

    // Initialize schema
    Constructor.prototype.schema = new Model.Schema(Constructor, 
                                                    schema, 
                                                    null, 
                                                    utils.keys(virtuals || {}),
                                                    options);

    return utils.extendConstructor(Constructor, methods, virtuals, statics);

    ////////

    /**
     * Get attr
     */
    function attr(self) {
      return $(self).attributes;
    }

    /**
     * Construct the object
     * This sets default values for the attributes
     */
    function construct(self, args) {
      $(self).attributes  = {};
      $(self).listeners   = {};
      var l = self.schema.length,
          i = l;
      while (i--) {
        // Only if default is defined
        if (self.schema[l - i - 1].hasDefault()) {
          self[self.schema[l - i - 1].name] = self.schema[l - i - 1].getDefault(self);
        }
      }
      return self;
    }

    /**
     * Filter
     */
    function filterData(name, data) {
      // Return data
      return data;
    }

    /**
     * Get attribute
     */
    function getAttribute(name) {
      // Get method
      var method  = utils.camelCase(['get', name, 'attribute'].join(' ')),
          orig    = attr(this)[name];
      // If set
      if (utils.isFunction(this[method])) {
        // Use it
        return this[method].apply(this, [orig]);
      } else {
        return orig;
      }
    }

    /**
     * Inherit the Model
     */
    function inherit(extendSchema, defineModel) {
      var parentSchema  = this.prototype.schema,
          childSchema   = parentSchema.export(extendSchema),
          methods       = {},
          options       = utils.clone(parentSchema.options || {}),
          statics       = {},
          virtuals      = {};
      // Inherit parent
      return utils.inherit(parentSchema.Constructor, function(construct) {
        return defineModel(construct, methods, virtuals, statics, options);
      }, function(proto, Constructor) {
        proto.schema = new Model.Schema(Constructor, 
                                        childSchema, 
                                        parentSchema, 
                                        utils.keys(virtuals || {}),
                                        options);
        return utils.extendConstructor(Constructor, methods, virtuals, statics);
      });
    }

    /**
     * Load data
     * @param data The data to load
     */
    function loadData(data) {
      var self = this;
      // Call filter
      data = this.filter('load', data);
      // If there's data
      if (utils.isDefined(data)) {
        this.fire('beforeload', [data]);
        var l = this.schema.length,
            i = l;
        while (i--) {
          // If data is defined
          if (utils.isDefined(data[this.schema[l - i - 1].name])) {
            self[this.schema[l - i - 1].name] = data[this.schema[l - i - 1].name];
          }
        }
        this.fire('load');
      }
      return this;
    }

    /**
     * Set attribute
     */
    function setAttribute(name, value) {
      var key         = this.schema.get(name),
          attributes  = attr(this),
          previous    = attributes[name],
          method      = utils.camelCase(['set', name, 'attribute'].join(' ')),
          evaluated   = key.evaluate(value, this);
      // If method is set
      if (utils.isFunction(this[method])) {
        attributes[name] = this[method].apply(this, [evaluated, previous]);
      } else {
        attributes[name] = evaluated;
      }
      // If result is an object
      if (attributes[name] && typeof attributes[name] === 'object') {
        utils.$(attributes[name]).parent = this;
      }
      this.fire('setAttribute', [name, attributes[name], previous]);
      this.fire(method, [attributes[name], previous]);
      // If changed
      if (utils.typeCompare(key.type, attributes[name], previous)) {
        this.change();
      }
      return this;
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
      var i = 0,
          l = 0,
          self    = this,
          object  = {};
      if (utils.isDefined(exclude)) {
        if (utils.is('String', exclude)) {
          exclude = [exclude];
        }
        if (utils.is('Array', exclude)) {
          exclude = utils.arrayOfStringsToObject(exclude);
        }
      } else {
        exclude = {};
      }
      if (!utils.is('Object', exclude)) {
        this.throw('`exclude` must be an object or an array of strings');
      }
      // Register value
      function registerValue(key) {
        var keyName = key.name || key;
        // Must not be excluded
        if (exclude[keyName] !== true) {
          var exportMethod  = utils.camelCase(['export', keyName, 'attribute'].join(' ')),
              value         = utils.isFunction(self[exportMethod]) ?
                              self[exportMethod].apply(self, [self[keyName]]) :
                              self[keyName],
              hasToObject   = value && utils.isFunction(value.toObject);
          // If no toObject but object and not array
          if (!hasToObject              && 
              utils.is('Object', value) &&
              !utils.is('Array', value)) {
            if (utils.is('Date', value)) {
              value = value.toString();
            } else {
              value = utils.cleanObject(value);
            }
          }
          object[keyName] = hasToObject ? value.toObject(exclude[keyName]) : value;
        }
      }
      i = l = this.schema.length;
      while (i--) {
        registerValue(this.schema[l - i - 1]);
      }
      // If there's virtuals in export
      if (this.schema.options         &&
          this.schema.options.export  &&
          !!this.schema.options.export.virtuals) {
        i = l = this.schema.virtuals.length;
        while (i--) {
          registerValue(this.schema.virtuals[l - i - 1]);
        }
      }
      object = this.filter('export', object);
      this.fire('export', [object, exclude]);
      return object;
    }
  }
})(window);