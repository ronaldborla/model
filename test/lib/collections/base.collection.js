'use strict';

var modeljs = require('../../../dist/model').modeljs;

/**
 * Define Base collection
 */
var schema = new modeljs.Schema(BaseCollection);

/**
 * Methods
 */
schema.methods.mapAttribute 		= mapAttribute;
schema.methods.sortByAttribute 	= sortByAttribute;

/**
 * Register Base collection
 */
modeljs.collection('BaseCollection', schema);

////////

/**
 * The constructor
 */
function BaseCollection(data) {
	schema.super(this, 'constructor', arguments);
	this.load(data);
}

/**
 * Map attribute
 */
function mapAttribute(attribute) {
	return this.map(function(item) {
		return item.getAttribute(attribute);
	});
}

/**
 * Sort collection by attribute
 */
function sortByAttribute(attribute, order) {
	var type = this.type;
	if (modeljs.utils.isUndefined(order)) {
		order = 1;
	}
	this.sort(function(a, b) {
		return type.compare(a.getAttribute(attribute), b.getAttribute(attribute)) * order;
	});
	return this;
}