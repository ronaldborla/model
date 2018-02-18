'use strict';

var modeljs = require('../../../dist/model').modeljs;

/**
 * Keys trait
 */
var keys = new modeljs.Trait();

// Get properties
keys.methods.getProperties = getProperties;
// Statics
keys.statics.HELLO = 'world';
// Virtuals
keys.virtuals.keys = getKeys;

/**
 * Register trait
 */
modeljs.trait('Keys', keys);

/**
 * Get properties
 */
function getProperties(type) {
	return this.constructor.schema['all_' + type];
}

/**
 * Get keys
 */
function getKeys() {
	return this.constructor.schema.all_keys.map(function(key) {
		return key.name;
	});
}