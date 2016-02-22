var gulp = require('gulp');
var babelify = require('babelify');
var browserify = require('browserify');
var connect = require('gulp-connect');
var cssmin = require('gulp-cssmin');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var react = require('gulp-react');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

var files = {
  dependencies: [
    'react',
    'react-dom',
    'react-addons-update',
    'fixed-data-table'
  ],

  browserify: [
    './src/main.js'
  ],

  jsx: [
    './src/components/data-table/data-table.js'
  ],

  css: [
    './src/components/data-table/base.css',
    './src/components/data-table/custom.css'
  ]
};

var browserifyTask = function (options) {

  var bundler = browserify({
    entries: [options.src],
    "transform": [
      ['babelify', {presets: ['react']}]
    ],
    debug: options.development,
    cache: {}, // Requirement of watchify
    packageCache: {}, // Requirement of watchify
    fullPaths: options.development,
  });

  var rebundle = function () {
    var start = Date.now();
    console.log('Building APP bundle');
    bundler
      .bundle()
      .on('error', gutil.log)
      .pipe(source(options.output))
      .pipe(gulpif(!options.development, streamify(uglify())))
      .pipe(gulp.dest(options.dest))
      .pipe(gulpif(options.development, connect.reload()))
      .pipe(notify(function () {
        console.log('APP bundle built in ' + (Date.now() - start) + 'ms');
      }));
  };

  if (options.development) {
    bundler.external(files.dependencies);
    bundler = watchify(bundler);
    bundler.on('update', rebundle);

    var vendorsBundler = browserify({
     debug: true,
     require: files.dependencies
    });

    var start = new Date();
    console.log('Building VENDORS bundle');
    vendorsBundler.bundle()
      .on('error', gutil.log)
      .pipe(source('vendors.js'))
      .pipe(gulp.dest(options.dest))
      .pipe(notify(function () {
        console.log('VENDORS bundle built in ' + (Date.now() - start) + 'ms');
      }));
  }

  rebundle();

};

var cssTask = function (options) {

  var start = new Date();
  console.log('Building CSS bundle');
  gulp.src(options.src)
    .pipe(concat(options.output))
    .pipe(gulpif(options.minify, cssmin()))
    .pipe(gulp.dest(options.dest))
    .pipe(gulpif(options.server, connect.reload()))
    .pipe(notify(function () {
      console.log('CSS bundle built in ' + (Date.now() - start) + 'ms');
    }));

};

var JSXTask = function (options) {

  var start = new Date();
  console.log('Transforming JSX');
  gulp.src(options.src)
    .pipe(react())
    .on('error', gutil.log)
    .pipe(gulp.dest(options.dest))
    .pipe(notify(function () {
      console.log('JSX transformed in ' + (Date.now() - start) + 'ms');
    }));

};

gulp.task('deploy', function () {

  JSXTask({
    src: files.jsx,
    dest: './dist/scripts'
  });

  cssTask({
    minify: false,
    server: false,
    src: files.css,
    output: 'dynamic-material-table.css',
    dest: './dist/styles'
  });

});

gulp.task('demo', function () {

  browserifyTask({
    development: false,
    src: files.browserify,
    output: 'dynamic-material-table.min.js',
    dest: './demo/scripts'
  });

  cssTask({
    minify: true,
    server: false,
    src: files.css,
    output: 'dynamic-material-table.min.css',
    dest: './demo/styles'
  });

});

gulp.task('default', function() {

  var browserifyOpt = {
    development: true,
    src: files.browserify,
    output: 'dynamic-material-table.js',
    dest: './build/scripts'
  };

  var cssOpt = {
    minify: false,
    server: true,
    src: files.css,
    output: 'dynamic-material-table.css',
    dest: './build/styles'
  };

  var serverOpt = {
    root: './build',
    port: 8889,
    livereload: true
  };

  browserifyTask(browserifyOpt);
  cssTask(cssOpt);
  connect.server(serverOpt);

  var watcher = gulp.watch(files.css, function () {
    cssTask(cssOpt);
  });

});