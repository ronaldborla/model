'use strict';

var assert  	= require('chai').assert,
		modeljs 	= require('../../dist/model').modeljs,
		User 			= modeljs.model('User'),
		data 			= require('../data/user'),
		full_name = [data.profile.first_name, data.profile.last_name].join(' '),
		user 			= new User(data);

describe('User', function() {
	it('should be an instance of `User`', function() {
		assert.instanceOf(user, User);
	});
	it('should be an instance of `Base`', function() {
		assert.instanceOf(user, modeljs.model('Base'));
	});
	it('should be an instance of `Model`', function() {
		assert.instanceOf(user, modeljs.Model);
	});
	describe('#constructor', function() {
		it('should be `User`', function() {
			assert.strictEqual(user.constructor, User);
		});
		describe('#__name', function() {
			it('should be a string', function() {
				assert.typeOf(user.constructor.__name, 'string');
			});
			it('should be `User`', function() {
				assert.strictEqual(user.constructor.__name, 'User');
			});
		});
	});
	describe('#id', function() {
		it('should be a number', function() {
			assert.typeOf(user.id, 'number');
		});
		it('should be equal to 1', function() {
			assert.strictEqual(user.id, 1);
		});
	});
	describe('#added', function() {
		it('should be a date', function() {
			assert.typeOf(user.added, 'date');
		});
	});
	describe('#updated', function() {
		it('should be a date', function() {
			assert.typeOf(user.updated, 'date');
		});
	});
	describe('#username', function() {
		it('should be a string', function() {
			assert.typeOf(user.username, 'string');
		});
		it('should be equal to `' + data.username  + '`', function() {
			assert.strictEqual(user.username, data.username);
		});
	})
	describe('#profile', function() {
		it('should be an instance of `Profile`', function() {
			assert.instanceOf(user.profile, modeljs.model('Profile'));
		});
		it('should be an instance of `Model`', function() {
			assert.instanceOf(user.profile, modeljs.Model);
		});
		describe('#first_name', function() {
			it('should be a string', function() {
				assert.typeOf(user.profile.first_name, 'string');
			});
			it('should be equal to `' + data.profile.first_name + '`', function() {
				assert.strictEqual(user.profile.first_name, data.profile.first_name);
			})
		});
		describe('#last_name', function() {
			it('should be a string', function() {
				assert.typeOf(user.profile.last_name, 'string');
			});
			it('should be equal to `' + data.profile.last_name + '`', function() {
				assert.strictEqual(user.profile.last_name, data.profile.last_name);
			})
		});
		describe('#sex', function() {
			it('should be an instance of `Enum`', function() {
				assert.isOk(modeljs.type('Enum').is(user.profile.sex));
			});
			it('should be equal to `' + data.profile.sex + '`', function() {
				assert.equal(user.profile.sex, data.profile.sex);
			});
		});
		describe('#full_name', function() {
			it('should be a string', function() {
				assert.typeOf(user.profile.full_name, 'string');
			});
			it('should be equal to `' + full_name + '`', function() {
				assert.strictEqual(user.profile.full_name, full_name);
			});
		});
	});
	describe('#load()', function() {
		it('should be a function', function() {
			assert.isFunction(user.load);
		});
	});
	describe('#toObject()', function() {
		it('should be a function', function() {
			assert.isFunction(user.toObject);
		});
		it('should return `profile.full_name` as `' + full_name + '`', function() {
			assert.strictEqual((user.toObject().profile || {}).full_name, full_name);
		});
		// Date attributes also need to be ignored because their default values are functions
		it('should be equal to user data ignoring `added`, `siblings`, `updated`, and `profile`', function() {
			assert.deepEqual(user.toObject([
				'added',
				'keys_count',
				'methods_count',
				'siblings.added',
				'siblings.keys_count',
				'siblings.methods_count',
				'siblings.statics_count',
				'siblings.profile.added',
				'siblings.profile.full_name', 
				'siblings.profile.keys',
				'siblings.profile.keys_count',
				'siblings.profile.methods_count',
				'siblings.profile.statics_count',
				'siblings.profile.updated',
				'siblings.profile.virtuals_count',
				'siblings.updated',
				'siblings.virtuals_count',
				'updated',
				'profile.added',
				'profile.full_name', 
				'profile.keys',
				'profile.keys_count',
				'profile.methods_count',
				'profile.statics_count',
				'profile.updated',
				'profile.virtuals_count',
				'statics_count',
				'virtuals_count',
			]), data);
		});
	});
	describe('#toJSON()', function() {
		it('should be a function', function() {
			assert.isFunction(user.toJSON);
		});
		it('should return a string', function() {
			assert.typeOf(user.toJSON(), 'string');
		});
	});
	describe('#toString()', function() {
		it('should be a function', function() {
			assert.isFunction(user.toString);
		});
		it('should return a string', function() {
			assert.typeOf(user.toString(), 'string');
		});
		it('should return a value equal to #toJSON() without parameters', function() {
			assert.strictEqual(user.toString(), user.toJSON());
		});
		it('should return a value equal to `user` appended with empty string', function() {
			assert.strictEqual(user.toString(), user + '');
		});
	});
	describe('#getAttribute()', function() {
		it('should be a function', function() {
			assert(user.getAttribute);
		});
		it('should return `' + data.username + '` if `username` is passed as a parameter', function() {
			assert.strictEqual(user.getAttribute('username'), data.username);
		});
		it('should return `' + data.profile.sex + '` if `profile.sex` is passed as parameter', function() {
			assert.equal(user.getAttribute('profile.sex'), data.profile.sex);
		});
	});
});