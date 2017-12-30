'use strict';

var users = [];

users.push(require('./user'));
users.push({
	added: 		new Date(),
	id: 			2,
	profile: {
		first_name: 'Jane',
		last_name: 	'Doe',
		sex: 				'female'
	},
	updated: 	new Date(),
	username: 'jane.doe'
});

module.exports = users;