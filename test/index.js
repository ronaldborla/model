'use strict';

var glob 		= require('glob'),
		modeljs = require('../dist/model').modeljs;

describe('modeljs', function() {
	describe('#boot()', function() {
		it('should boot without errors', function() {
			// Load all dependencies
			(glob.sync(__dirname + '/lib/*/*.js') || []).forEach(function(file) {
				require(file);
			});
			// Boot model
			modeljs.boot();
			// Perform all tests
			(glob.sync(__dirname + '/tests/*.js') || []).forEach(function(file) {
				require(file);
			});
		});
	});
});