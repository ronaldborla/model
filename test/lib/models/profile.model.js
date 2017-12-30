'use strict';

var modeljs = require('../../../dist/model').modeljs;

/**
 * Define Profile schema
 */
var schema = new modeljs.Schema(Profile, {
	first_name: String,
	last_name: 	String,
	sex: {
		type: 'Enum',
		default: 'male',
		options: [
			'male',
			'female'
		]
	}
}, {
	toObject: {
		virtuals: true
	}
});

/**
 * Virtuals
 */
schema.virtuals.full_name = getFullName;

/**
 * Inherit Base for Profile
 */
modeljs.model('Profile', schema, 'Base');

////////

/**
 * The Profile constructor
 */
function Profile() {
	schema.super(this, 'constructor', arguments);
}

/**
 * Get full name
 */
function getFullName() {
	return [this.first_name, this.last_name].join(' ');
}