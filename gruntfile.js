'use strict';

/**
 * Local variables
 */
var main = [
  'src/Model.js',
  'src/utils.js',
  'src/Collection.js',
  'src/Exception.js',
  'src/Schema.js',
  'src/Type.js',
  'src/Types/**/*.js',
  'src/Key.js'
];

module.exports = function (grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      main: {
        options: {
          port: 26752,
          keepalive: true
        }
      }
    },
    watch: {
      /**
       * All options
       */
      options: {
        debounceDelay: 100,
        interrupt: true
      },
      main: {
        files: main,
        tasks: ['jshint', 'concat']
      }
    },
    concurrent: {
      main: {
        tasks: ['connect', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    jshint: {
      main: {
        src: main,
        options: {
          jshintrc: true
        }
      }
    },
    concat: {
      main: {
        nonull: true,
        src: main,
        dest: 'dist/model.js',
        options: {
          sourceMap: false
        }
      }
    },
    uglify: {
      main: {
        options: {
          mangle: false,
          sourceMap: false
        },
        files: {
          'dist/model.min.js': 'dist/model.js'
        }
      }
    }
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);

  // JShint and compile
  grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
  // JShint and watch
  grunt.registerTask('default', ['jshint', 'concurrent']);
};
