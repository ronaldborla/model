'use strict';

var assert  = require('chai').assert,
		modeljs = require('../../dist/model').modeljs,
		data 		= require('../data/user'),
		Enum		= modeljs.type('Enum'),
		Type 		= modeljs.Schema.Key.Type,
		User 		= modeljs.model('User'),
		user 		= new User(data);

describe('Enum', function() {
	it('should be an instance of `Type`', function() {
		assert.instanceOf(Enum, Type);
	});
});

describe('User', function() {
	describe('#profile', function() {
		describe('#sex', function() {
			it('should be an `Enum`', function() {
				assert.isOk(Enum.is(user.profile.sex));
			});
			it('should throw an error if `sex` is assigned with `any`', function() {
				assert.throws(function() {
					user.profile.sex = 'any';
				});
			});
			it('should not throw an error if `sex` is assigned with `male` or `female`', function() {
				assert.doesNotThrow(function() {
					user.profile.sex = 'female';
				});
				assert.doesNotThrow(function() {
					user.profile.sex = 'male';
				});
			});
			it('should be equal to `male`', function() {
				assert.equal(user.profile.sex, 'male');
				assert.isOk(user.profile.sex.equals('male'));
				assert.strictEqual(user.profile.sex.toObject(), 'male');
				assert.strictEqual(user.profile.sex.toString(), 'male');
			});
		});
	});
});