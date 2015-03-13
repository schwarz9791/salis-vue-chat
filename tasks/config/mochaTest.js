module.exports = function(grunt){
  grunt.config.set('mochaTest',{
    test: {
      options: {
        reporter: 'spec',
        captureFile: 'test/outputs/results.txt', // Optionally capture the reporter output to a file
        /*require: [ function(){ expect = require('chai').expect;},
                   function(){ sinon = require('sinon');}
        ]*/
        globals: ['expect','sinon'],
        timeout: false // Optionally buy time to do `sails lift`
      },
      src: ['test/helpers/globals.js','test/**/*.spec.js']
    }
  });
  grunt.loadNpmTasks('grunt-mocha-test');
};