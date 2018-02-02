'use strict';

var users = [];

users.push(require('./user'));
users.push({
	id: 2,
	profile: {
		id: 2,
		first_name: 'Jane',
		last_name: 	'Doe',
		sex: 				'female'
	},
	username: 'jane.doe'
});

module.exports = users;