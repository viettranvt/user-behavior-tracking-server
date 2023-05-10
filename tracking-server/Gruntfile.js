module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      options: {
        separator: ';\n',
        banner: '(function(){\'use strict\';\n',
        footer: '\n})();'
      },
      dist: {
        src: [
          'public/config.js',
          'public/constants/*.js',
          'public/helpers/*.js',
          'public/viewer.js'
        ],
        dest: 'dist/viewer.js',
      },
    },
    uglify: {
      my_target: {
        options: {
          sourceMap: {
            includeSources: true
          }
        },
        files: {
          'dist/viewer.min.js': ['dist/viewer.js']
        }
      }
    },
    watch: {
      js: {
        files: ['public/**/*.js'],
        tasks: ['concat', 'uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);

};