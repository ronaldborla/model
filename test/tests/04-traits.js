'use strict';

var assert  	= require('chai').assert,
		modeljs 	= require('../../dist/model').modeljs,
		User 			= modeljs.model('User'),
		data 			= require('../data/user'),
		user 			= new User(data);

describe('User', function() {
	describe('#metaCount()', function() {
		it('should be a function', function() {
			assert.isFunction(user.metaCount);
		});
	});
	describe('#keys_count', function() {
		it('should be equal to 6', function() {
			assert.strictEqual(user.keys_count, 6);
		});
	});
	describe('#methods_count', function() {
		it('should be equal to 3', function() {
			assert.strictEqual(user.methods_count, 3);
		});
	});
	describe('#statics_count', function() {
		it('should be equal to 0', function() {
			assert.strictEqual(user.statics_count, 0);
		});
	});
	describe('#virtuals_count', function() {
		it('should be equal to 4', function() {
			assert.strictEqual(user.virtuals_count, 4);
		});
	});
	describe('#profile', function() {
		describe('#getProperties()', function() {
			it('should be a function', function() {
				assert.isFunction(user.profile.getProperties);
			});
			it('should return [`getProperties`, `compare`, `getAttribute`, `metaCount`] when `methods` is passed as a parameter', function() {
				assert.deepStrictEqual(user.profile.getProperties('methods'), [
					'getProperties', 
					'compare', 
					'getAttribute', 
					'metaCount'
				]);
			});
		})
		describe('#keys', function() {
			it('should be an array', function() {
				assert.isArray(user.profile.keys);
			});
			it('should be equal to [`added`, `id`, `updated`, `first_name`, `last_name`, `sex`]', function() {
				assert.deepStrictEqual(user.profile.keys, [
					'added',
					'id',
					'updated',
					'first_name',
					'last_name',
					'sex'
				]);
			});
		});
		describe('#keys_count', function() {
			it('should be equal to 6', function() {
				assert.strictEqual(user.profile.keys_count, 6);
			});
		});
		describe('#methods_count', function() {
			it('should be equal to 4', function() {
				assert.strictEqual(user.profile.methods_count, 4);
			});
		});
		describe('#statics_count', function() {
			it('should be equal to 1', function() {
				assert.strictEqual(user.profile.statics_count, 1);
			});
		});
		describe('#virtuals_count', function() {
			it('should be equal to 6', function() {
				assert.strictEqual(user.profile.virtuals_count, 6);
			});
		});
	});
});