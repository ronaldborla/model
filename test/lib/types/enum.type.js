'use strict';

var modeljs = require('../../../dist/model').modeljs;

/**
 * Methods
 */
Enum.prototype.compare 	= compare;
Enum.prototype.equals 	= equals;
Enum.prototype.load 		= load;
Enum.prototype.toObject = toObject;
Enum.prototype.toString = toString;
Enum.prototype.validate = validate;

/**
 * Register type
 */
modeljs.type('Enum', Enum);

////////

/**
 * The Enum constructor
 */
function Enum(value, options) {
	if (!modeljs.utils.isUndefined(options) && !modeljs.utils.isFunction(options.indexOf)) {
		throw new Error('Invalid enum options');
	}
	this.options = options;
	this.value = this.validate(value);
}

/**
 * Compare
 */
function compare(e) {
	if (this.value > e.value) {
		return 1;
	} else if (e.value > this.value) {
		return -1;
	} else {
		return 0;
	}
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
	this.value = this.validate(value);
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

/**
 * Validate
 */
function validate(value) {
	if (this.options.indexOf(value) < 0) {
		throw new Error('Invalid enum value: ' + value);
	}
	return value;
}