/*global module:true */

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg     : grunt.file.readJSON('package.json'),
    banner  : '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %> */\n',
    concat  : {
      options : {
        banner : '<%= banner %>'
      },
      dist    : {
        src  : ['src/marionette.formview.js'],
        dest : 'dist/FormView.js'
      }
    },
    uglify  : {
      options : {
        banner : '<%= banner %>'
      },
      dist    : {
        src  : '<%= concat.dist.dest %>',
        dest : 'dist/FormView.min.js'
      }
    },

    jshint : {

      options : {
        jshintrc : './.jshintrc'
      },
      all : [
        'Gruntfile.js',
        'src/js/**/*.js',
        'spec/**/*.js',
        '!spec/helpers/**/*.js'
      ]
    },

    jasmine : {
      test : {
        src     : [
          'vendor/jquery-1.8.2.js',
          'vendor/underscore-1.4.4.js',
          'vendor/backbone-1.0.0.js',
          'vendor/backbone.marionette-1.0.3.js',
          'src/marionette.formview.js'
        ],
        options : {
          helpers : 'spec/helpers/*.js',
          specs   : [
            'spec/**/*Spec.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine']);
  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('test-web', ['jasmine-server']);

  //Turned LINT off complaining about /*jshint unused:true */
  grunt.registerTask('build', ['concat', 'uglify', 'jasmine']);
  grunt.registerTask('build-notest', ['jshint', 'concat', 'uglify']);

};
