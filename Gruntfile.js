module.exports = function(grunt) {
  grunt.initConfig({
    requirejs: {
      poc: {
        options: {
            appDir: 'src',
            baseUrl: 'js',
            dir: 'dist/POC',
            mainConfigFile: 'src/js/startup.js',
            optimize: 'none',
            optimizeCss: 'none',
            removeCombined: true,
            name: 'startup',
            exclude: ['jquery','highcharts-core', 'highcharts-more', 'bootstrap', 'canvg', 'highstock'],
            include: ['biligram/controller'],
        },
      },
      prd: {
        options: {
        appDir: 'src',
        baseUrl: 'js',
        dir: 'dist/PRD',
        optimize: 'uglify2',
        optimizeCss: 'standard',
        mainConfigFile: 'src/js/startup.js',
        removeCombined: true,
        name: 'startup',
        exclude: ['jquery', 'highcharts-core', 'highcharts-more', 'bootstrap', 'canvg', 'highstock'],
        include: ['biligram/controller'],
        uglify2: {
          compress: {drop_console: true},
        },
        writeBuildTxt: false,
      },
    },
}});

grunt.loadNpmTasks('grunt-contrib-requirejs');
grunt.registerTask('default', ['requirejs:poc', 'requirejs:prd']);





};
