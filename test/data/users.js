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
	siblings: [{
		id: 5,
		profile: {
			id: 5,
			first_name: 'Charlie',
			last_name: 	'Doe',
			sex: 				'male'
		},
		username: 'charlie.doe'
	}, {
		id: 6,
		profile: {
			id: 6,
			first_name: 'Donna',
			last_name: 	'Doe',
			sex: 				'female'
		},
		username: 'donna.doe'
	}],
	username: 'jane.doe'
});

module.exports = users;