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
 * Virtuals
 */
schema.virtuals.first = getFirst;

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
 * Get first in array
 */
function getFirst() {
	return this[0];
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
	if (modeljs.utils.isUndefined(order)) {
		order = 1;
	}
	this.sort(function(a, b) {
		var left = a.getAttribute(attribute),
				right = b.getAttribute(attribute);
		return left.constructor.type.compare(left, right) * order;
	});
	return this;
}