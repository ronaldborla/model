'use strict';

var modeljs = require('../../../dist/model').modeljs;

/**
 * Meta trait
 */
var meta = new modeljs.Trait();

// Methods
meta.methods.metaCount = metaCount;
// Virtuals
meta.virtuals.keys_count = countKeys;
meta.virtuals.methods_count = countMethods;
meta.virtuals.statics_count = countStatics;
meta.virtuals.virtuals_count = countVirtuals;

/**
 * Register trait
 */
modeljs.trait('Meta', meta);

/**
 * Count keys
 */
function countKeys() {
	return this.metaCount('keys');
}

/**
 * Count methods
 */
function countMethods() {
	return this.metaCount('methods');
}

/**
 * Count statics
 */
function countStatics() {
	return this.metaCount('statics');
}

/**
 * Count virtuals
 */
function countVirtuals() {
	return this.metaCount('virtuals');
}

/**
 * Count meta stats
 */
function metaCount(type) {
	switch (type) {
		case 'keys':
		case 'methods':
		case 'statics':
		case 'virtuals':
			return this.constructor.schema['all_' + type].length;
		default:
			return 0;
	}
}