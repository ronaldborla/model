'use strict';

var modeljs = require('../../../dist/model').modeljs;

/**
 * Methods
 */
Enum.prototype.equals 	= equals;
Enum.prototype.load 		= load;
Enum.prototype.toObject = toObject;
Enum.prototype.toString = toString;

/**
 * Register type
 */
modeljs.type('Enum', Enum);

////////

/**
 * The Enum constructor
 */
function Enum(value, options) {
	if (options && modeljs.utils.isFunction(options.indexOf) && options.indexOf(value) < 0) {
		throw new Error('Invalid enum value: ' + value);
	}
	this.value = value;
}

/**
 * Equals
 */
function equals(value) {
	return value === this.value;
}

/**
 * Load value
 */
function load(value) {
	this.value = value;
	return this;
}

/**
 * Export toObject
 */
function toObject() {
	return this.value;
}

/**
 * To string
 */
function toString() {
	return this.value + '';
}