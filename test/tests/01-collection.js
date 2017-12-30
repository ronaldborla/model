'use strict';

var assert  		= require('chai').assert,
		modeljs 		= require('../../dist/model').modeljs,
		User 				= modeljs.model('User'),
		Users 			= modeljs.collection('Users'),
		data 				= require('../data/users'),
		users 			= new Users(data);

var full_names 	= data.map(function(item) {
	return [item.profile.first_name, item.profile.last_name].join(' ')
});

describe('Users', function() {
	it('should be an instance of `Users`', function() {
		assert.instanceOf(users, Users);
	});
	it('should be an instance of `BaseCollection`', function() {
		assert.instanceOf(users, modeljs.collection('BaseCollection'));
	});
	it('should be an instance of `Collection`', function() {
		assert.instanceOf(users, modeljs.Collection);
	});
	it('should be an instance of `Array`', function() {
		assert.instanceOf(users, Array);
	});
	describe('#model', function() {
		it('should be `User`', function() {
			assert.strictEqual(users.model, User);
		});
		describe('#__name', function() {
			it('should be a string', function() {
				assert.typeOf(users.model.__name, 'string');
			});
			it('should be `User`', function() {
				assert.strictEqual(users.model.__name, 'User');
			});
		});
	});
	describe('#type', function() {
		it('should be an instance of `Type`', function() {
			assert.instanceOf(users.type, modeljs.Schema.Key.Type);
		});
		describe('#__constructor', function() {
			it('should be `User`', function() {
				assert.strictEqual(users.type.__constructor, User);
			});
		});
		describe('#name', function() {
			it('should be a string', function() {
				assert.typeOf(users.type.name, 'string');
			});
			it('should be `User`', function() {
				assert.strictEqual(users.type.name, 'User');
			});
		});
	});
	describe('#length', function() {
		it('should be a number', function() {
			assert.typeOf(users.length, 'number');
		});
		it('should be `2`', function() {
			assert.strictEqual(users.length, 2);
		});
	});
	describe('#[0]', function() {
		it('should be an instance of `User`', function() {
			assert.instanceOf(users[0], User);
		});
	});
	describe('#first_names', function() {
		it('should be an array of strings', function() {
			assert.typeOf(users.first_names[0], 'string');
			assert.typeOf(users.first_names[1], 'string');
		});
		it('should be `' + data[0].profile.first_name + '` and `' + data[1].profile.first_name + '`', function() {
			assert.strictEqual(users.first_names[0], data[0].profile.first_name);
			assert.strictEqual(users.first_names[1], data[1].profile.first_name);
		});
	});
	describe('#load()', function() {
		it('should be a function', function() {
			assert.isOk(modeljs.utils.isFunction(users.load));
		});
	});
	describe('#toObject()', function() {
		it('should be a function', function() {
			assert.isOk(modeljs.utils.isFunction(users.toObject));
		});
		it('should return an array', function() {
			assert.isOk(Array.isArray(users.toObject()));
		});
		describe('#[0]', function() {
			it('should return `profile.full_name` as `' + full_names[0] + '`', function() {
				assert.strictEqual((((users.toObject() || [])[0] || {}).profile || {}).full_name, full_names[0]);
			});
			it('should be equal to first users data ignoring `profile.full_name`', function() {
				assert.deepEqual((users.toObject(['profile.full_name']) || [])[0], data[0]);
			});
		});
	});
	describe('#toJSON()', function() {
		it('should be a function', function() {
			assert.isOk(modeljs.utils.isFunction(users.toJSON));
		});
		it('should return a string', function() {
			assert.typeOf(users.toJSON(), 'string');
		});
	});
	describe('#toString()', function() {
		it('should be a function', function() {
			assert.isOk(modeljs.utils.isFunction(users.toString));
		});
		it('should return a string', function() {
			assert.typeOf(users.toString(), 'string');
		});
		it('should return a value equal to #toJSON() without parameters', function() {
			assert.strictEqual(users.toString(), users.toJSON());
		});
		it('should return a value equal to `user` appended with empty string', function() {
			assert.strictEqual(users.toString(), users + '');
		});
	});
	describe('#mapAttribute()', function() {
		it('should be a function', function() {
			assert.isOk(modeljs.utils.isFunction(users.mapAttribute));
		});
		it('should return an array of numbers if `id` is passed as parameter', function() {
			assert.typeOf((users.mapAttribute('id') || [])[0], 'number');
			assert.typeOf((users.mapAttribute('id') || [])[1], 'number');
		});
		it('should return `' + data[0].id + '` and `' + data[1].id + '` if `id` is passed as parameter', function() {
			assert.strictEqual((users.mapAttribute('id') || [])[0], data[0].id);
			assert.strictEqual((users.mapAttribute('id') || [])[1], data[1].id);
		});
		it('should return an array of strings if `profile.full_name` is passed as parameter', function() {
			assert.typeOf((users.mapAttribute('profile.full_name') || [])[0], 'string');
			assert.typeOf((users.mapAttribute('profile.full_name') || [])[1], 'string');
		});
		it('should return `' + full_names[0] + '` and `' + full_names[1] + '` if `profile.full_name` is passed as parameter', function() {
			assert.strictEqual((users.mapAttribute('profile.full_name') || [])[0], full_names[0]);
			assert.strictEqual((users.mapAttribute('profile.full_name') || [])[1], full_names[1]);
		});
	});
	describe('#sortByAttribute()', function() {
		it('should be a function', function() {
			assert.isOk(modeljs.utils.isFunction(users.sortByAttribute));
		});
		it('should return an instance of `Array`', function() {
			users.sortByAttribute('profile.first_name');
			assert.instanceOf(users, Array);
		});
		it('should return first item `profile.first_name` as `' + data[1].profile.first_name + '`', function() {
			users.sortByAttribute('profile.first_name');
			assert.strictEqual(users[0].getAttribute('profile.first_name'), data[1].profile.first_name);
		});
		it('should return first item `username` with second parameter `-1` as `' + data[0].username + '`', function() {
			users.sortByAttribute('username', -1);
			assert.strictEqual(users[0].getAttribute('username'), data[0].username);
		});
	});
	describe('#concat()', function() {
		var collection = new Users();
		collection.concat(data);
		it('should have a length of `2` after being called', function() {
			assert.strictEqual(collection.length, 2);
		});
		it('should be a valid `Users` collection after being called', function() {
			assert.isOk(isValidUsers(collection));
			// Concat here to fix race condition
			collection.concat(data, data);
		});
		it('should have a length of `6` after being called again', function() {
			assert.strictEqual(collection.length, 6);
		});
		it('should be a valid `Users` collection after being called again', function() {
			assert.isOk(isValidUsers(collection));
		});
	});
	describe('#fill()', function() {
		var collection = new Users(data);
		collection.fill(data[0]);
		it('should have a length of `2` after being called', function() {
			assert.strictEqual(collection.length, 2);
		});
		it('should be a valid `Users` collection after being called', function() {
			assert.isOk(isValidUsers(collection));
		});
		it('should return equal items', function() {
			assert.deepEqual(collection[0], collection[1]);
		});
		it('should return `' + full_names[0] + '` and `' + full_names[0] + '` for each `profile.full_name`', function() {
			assert.strictEqual(collection[0].getAttribute('profile.full_name'), full_names[0]);
			assert.strictEqual(collection[1].getAttribute('profile.full_name'), full_names[0]);
		});
	});
	describe('#push()', function() {
		var collection = new Users();
		collection.push(data[0]);
		it('should have a length of `1` after being called', function() {
			assert.strictEqual(collection.length, 1);
		});
		it('should be a valid `Users` collection after being called', function() {
			assert.isOk(isValidUsers(collection));
			// Push here to fix race condition
			collection.push(data[0], data[1]);
		});
		it('should have a length of `3` after being called again', function() {
			assert.strictEqual(collection.length, 3);
		});
		it('should be a valid `Users` collection after being called again', function() {
			assert.isOk(isValidUsers(collection));
		});
		it('should return `' + full_names[0] + '` for `profile.full_name` of second item after being called', function() {
			assert.strictEqual(collection[1].getAttribute('profile.full_name'), full_names[0]);
		});
	});
	describe('#splice()', function() {
		var collection = new Users(data);
		collection.splice(0, 2, data[0], data[1]);
		it('should have a length of `2` after being called', function() {
			assert.strictEqual(collection.length, 2);
		});
		it('should be a valid `Users` collection after being called', function() {
			assert.isOk(isValidUsers(collection));
		});
	});
	describe('#unshift()', function() {
		var collection = new Users();
		collection.unshift(data[0]);
		it('should have a length of `1` after being called', function() {
			assert.strictEqual(collection.length, 1);
		});
		it('should be a valid `Users` collection after being called', function() {
			assert.isOk(isValidUsers(collection));
			// Push here to fix race condition
			collection.unshift(data[0], data[1]);
		});
		it('should have a length of `3` after being called again', function() {
			assert.strictEqual(collection.length, 3);
		});
		it('should be a valid `Users` collection after being called again', function() {
			assert.isOk(isValidUsers(collection));
		});
		it('should return `' + full_names[1] + '` for `profile.full_name` of first item after being called', function() {
			assert.strictEqual(collection[1].getAttribute('profile.full_name'), full_names[1]);
		});
	});
});

/**
 * Check if collection is valid Users
 */
function isValidUsers(collection) {
	if (!(collection instanceof Users)) {
		return false;
	}
	if (!(collection instanceof modeljs.Collection)) {
		return false;
	}
	for (var i = 0; i < collection.length; i++) {
		if (!(collection[i] instanceof User)) {
			return false;
		}
		if (collection[i].__private__.collection !== collection) {
			return false;
		}
	}
	return true;
}