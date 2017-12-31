'use strict';

var assert  	= require('chai').assert,
		modeljs 	= require('../../dist/model').modeljs,
		Profile 	= modeljs.model('Profile'),
		User 			= modeljs.model('User'),
		Users			= modeljs.collection('Users'),
		data 			= require('../data/users'),
		delay 		= 1,
		off 			= [],
		users			= new Users(data);

describe('User', function() {
	describe('#on()', function() {
		it('should return a callback', function() {
			off.push(users.first.on('callUser', function(e, callback) {
				callback(e, this);
			}));
			assert.isFunction(off[off.length - 1]);
		});
	});
	describe('#profile', function() {
		describe('#on()', function() {
			it('should return a callback', function() {
				off.push(users.first.profile.on('callProfile', function(e, callback) {
					callback(e, this);
				}));
				assert.isFunction(off[off.length - 1]);
			});
		});
		describe('#fire()', function() {
			it('should trigger callback to `callProfile` event and event name is `callProfile`', function(done) {
				setTimeout(function() {
					users.first.profile.fire('callProfile', [function(e, value) {
						assert.strictEqual(e.name, 'callProfile');
						done();
					}]);
				}, delay);
			});
			it('should trigger callback to `callProfile` event and event source is an instance of `Profile`', function(done) {
				setTimeout(function() {
					users.first.profile.fire('callProfile', [function(e, value) {
						assert.instanceOf(e.source, Profile);
						done();
					}]);
				}, delay);
			});
			it('should trigger callback to `callProfile` event and value is an instance of `Profile`', function(done) {
				setTimeout(function() {
					users.first.profile.fire('callProfile', [function(e, value) {
						assert.instanceOf(value, Profile);
						done();
					}]);
				}, delay);
			});
			it('should trigger callback to `callProfile` event and match `profile.full_name` of first item in collection', function(done) {
				setTimeout(function() {
					users.first.profile.fire('callProfile', [function(e, value) {
						assert.strictEqual(value.full_name, users.first.profile.full_name);
						done();
					}]);
				}, delay);
			});
		});
		describe('#emit()', function() {
			it('should trigger callback from `profile` to `callUser` event and event name is `callUser`', function(done) {
				setTimeout(function() {
					users.first.profile.emit('callUser', [function(e, value) {
						assert.strictEqual(e.name, 'callUser');
						done();
					}]);
				}, delay);
			});
			it('should trigger callback to `callUser` event and event source is an instance of `Profile`', function(done) {
				setTimeout(function() {
					users.first.profile.emit('callUser', [function(e, value) {
						assert.instanceOf(e.source, Profile);
						done();
					}]);
				}, delay);
			});
			it('should trigger callback to `callUser` event and value is an instance of `User`', function(done) {
				setTimeout(function() {
					users.first.profile.emit('callUser', [function(e, value) {
						assert.instanceOf(value, User);
						done();
					}]);
				}, delay);
			});
		});
	});
});

describe('Users', function() {
	describe('#on()', function() {
		it('should return a callback', function() {
			off.push(users.on('callUsers', function(e, callback) {
				callback(e, this);
			}));
			assert.isFunction(off[off.length - 1]);
		});
	});
	describe('#first', function() {
		describe('#emit()', function() {
			it('should trigger callback from `profile` to `callUsers` event and event name is `callUsers`', function(done) {
				setTimeout(function() {
					users.first.profile.emit('callUsers', [function(e, value) {
						assert.strictEqual(e.name, 'callUsers');
						done();
					}]);
				}, delay);
			});
			it('should trigger callback to `callUsers` event and event source is an instance of `Profile`', function(done) {
				setTimeout(function() {
					users.first.profile.emit('callUsers', [function(e, value) {
						assert.instanceOf(e.source, Profile);
						done();
					}]);
				}, delay);
			});
			it('should trigger callback to `callUsers` event and value is an instance of `Users`', function(done) {
				setTimeout(function() {
					users.first.profile.emit('callUsers', [function(e, value) {
						assert.instanceOf(value, Users);
						done();
						// Disable and empty listeners
						off.forEach(function(removeListener) {
							removeListener();
						});
					}]);
				}, delay);
			});
			it('should not trigger any callback to `callUsers`', function(done) {
				setTimeout(function() {
					var timeout = setTimeout(function() {
						assert.isOk(true, '`callUsers` has timed out');
						completed();
					}, delay * 10);
					users.first.profile.emit('callUsers', [function(e, value) {
						assert.isOk(false, '`callUsers` event was triggered');
						completed();
					}]);
					function completed() {
						clearTimeout(timeout);
						done();
					}
				}, delay);
			});
		});
		describe('#fire()', function() {
			it('should not trigger any callback to `callUser`', function(done) {
				setTimeout(function() {
					var timeout = setTimeout(function() {
						assert.isOk(true, '`callUser` has timed out');
						completed();
					}, delay * 10);
					users.first.fire('callUser', [function(e, value) {
						assert.isOk(false, '`callUser` event was triggered');
						completed();
					}]);
					function completed() {
						clearTimeout(timeout);
						done();
					}
				}, delay);
			});
		});
		describe('#profile', function() {
			describe('#fire()', function() {
				it('should not trigger any callback to `callProfile`', function(done) {
					setTimeout(function() {
						var timeout = setTimeout(function() {
							assert.isOk(true, '`callProfile` has timed out');
							completed();
						}, delay * 10);
						users.first.profile.fire('callProfile', [function(e, value) {
							assert.isOk(false, '`callProfile` event was triggered');
							completed();
						}]);
						function completed() {
							clearTimeout(timeout);
							done();
						}
					}, delay);
				});
			});
		});
	});
});