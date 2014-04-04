'use strict';

module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      root: {
        src: 'index.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.spec.js']
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'test']);
  grunt.registerTask('test', ['mochaTest']);
};
