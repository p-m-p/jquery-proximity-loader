module.exports = function (grunt) {
  grunt.initConfig({
      jshint: {
          all: ['Gruntfile.js', 'js/jquery-proximity-loader.js']
        , options: {
            jshintrc: '.jshintrc'
          }
      }
    , jasmine: {
          src: 'js/jquery-proximity-loader.js'
        , options: {
              vendor: ['spec/lib/*.js']
            , specs: 'spec/**/*-spec.js'
          }
      }
    , uglify: {
        plugin: {
          // FIXME add version
          files: {
            'js/jquery-proximity-loader.min.js': 'js/jquery-proximity-loader.js'
          }
        }
      }
  });

  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('default', ['test', 'uglify']);
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};
