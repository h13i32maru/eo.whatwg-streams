module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['mocha'],
    files: [
      'bower_components/power-assert/build/power-assert.js',
      'out/src/index-browser.js',
      'out/test-espower/**/*.js'
    ],
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome', 'Safari'],
    singleRun: true,
    preprocessors: {
      'out/src/index-browser.js': ['coverage']
    },

    customLaunchers: {
      ChromeTravis: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  });
};
