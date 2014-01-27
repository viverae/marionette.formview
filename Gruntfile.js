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
    lint    : {
      src   : 'src/**/*.js',
      grunt : 'Gruntfile.js',
      tests : [
        'spec/**/*Spec.js'
      ]
    },
    jshint  : {
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
        es5     : true,
        unused  : true
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
          spyOn      : false,
          xit        : false
        }
      }
    },
    watch   : {
      files : ['<%= jasmine.specs %>', 'src/*js'],
      tasks : 'jasmine'
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
