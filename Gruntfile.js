module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    min    : {
      dist : {
        src  : ['src/FormView.js'],
        dest : 'dist/FormView.min.js'
      }
    },
    lint   : {
      src   : 'src/FormView.js',
      grunt : 'Gruntfile.js',
      tests : 'spec/FormViewSpec.js'
    },
    jshint : {
      options : {
        curly   : true,
        eqeqeq  : true,
        immed   : true,
        latedef : true,
        newcap  : true,
        noarg   : true,
        sub     : true,
        undef   : true,
        boss    : true,
        eqnull  : true,
        node    : true,
        es5     : true
      },
      globals : {
        jQuery : true
      },
      grunt   : {
        options : {node : true},
        globals : {
          task     : true,
          config   : true,
          file     : true,
          log      : true,
          template : true
        }
      },
      src     : {
        options : {unused : false}
      },
      tests   : {
        globals : {
          jasmine    : false,
          describe   : false,
          beforeEach : false,
          expect     : false,
          it         : false,
          spyOn      : false
        }
      }
    },

    watch            : {
      files : ['<config:jasmine.specs>', 'src/*js'],
      tasks : 'jasmine'
    },
    jasmine          : {
      src     : [
        'components/jquery/jquery.js',
        'components/underscore/underscore.js',
        'components/backbone/backbone.js',
        'components/backbone.marionette/lib/backbone.marionette.js',
        'src/FormView.js'
      ],
      specs   : 'spec/**/*.js',
      timeout : 10000
    },
    'jasmine-server' : {
      browser : true
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-runner');

  // Default task.
  grunt.registerTask('default', 'lint jasmine');
  grunt.registerTask('test', 'jasmine');
  grunt.registerTask('test-web', 'jasmine-server');
  grunt.registerTask('build', 'lint min jasmine');

};
