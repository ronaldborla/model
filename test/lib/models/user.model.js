'use strict';

var modeljs = require('../../../dist/model').modeljs;

/**
 * Define User Schema
 */
var schema = new modeljs.Schema(User, {
	profile: 	'Profile',
	siblings: 'Users',
	username: String
});

/**
 * Register User model
 */
modeljs.model('User', schema, 'Base');

////////

/**
 * The User constructor
 */
function User() {	
	schema.super(this, 'constructor', arguments);
}