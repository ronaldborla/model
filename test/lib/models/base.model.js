'use strict';

var modeljs = require('../../../dist/model').modeljs,
		utils 	= modeljs.utils;

/**
 * Define Base schema
 */
var schema = new modeljs.Schema(Base, {
	added: 		Date,
	id: 			Number,
	updated: 	Date
});

/**
 * Methods
 */
schema.methods.compare 			= compare;
schema.methods.getAttribute = getAttribute;

/**
 * Register Base model
 */
modeljs.model('Base', schema);

////////

/**
 * The Base constructor
 */
function Base(data) {
	schema.super(this, 'constructor', arguments);
	this.load(data);
}

/**
 * Compare models
 */
function compare(model) {
	return (this.id || 0) - (model.id || 0);
}

/**
 * Get attribute
 */
function getAttribute(name) {
	var pos = name.indexOf('.'),
			left = (pos >= 0) ? name.substr(0, pos) : name,
			right = (pos >= 0) ? name.substr(pos + 1) : '',
			attribute = this[left];
	if (attribute && utils.isFunction(attribute.getAttribute) && right) {
		return attribute.getAttribute(right);
	} else {
		return attribute;
	}
}