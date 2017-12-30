'use strict';

var modeljs = require('../../../dist/model').modeljs;

/**
 * Define Users collection
 */
var schema = new modeljs.Schema(Users);

/**
 * Virtuals
 */
schema.virtuals.first_names = getFirstNames;

/**
 * Register Users collection inheriting BaseCollection
 */
modeljs.collection('Users', schema, 'User', 'BaseCollection');

////////

/**
 * The constructor
 */
function Users() {
	schema.super(this, 'constructor', arguments);
}

/**
 * Get first names
 */
function getFirstNames() {
	return this.mapAttribute('profile.first_name');
}