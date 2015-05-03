var gulp = require("gulp"),
  amdOptimize = require("gulp-amd-optimize"),
  concat = require('gulp-concat'),
  htmlreplace = require('gulp-html-replace'),
  minifyCSS = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  addsrc = require('gulp-add-src');

gulp.task("scripts", function () {
  'use strict';
  return gulp.src("src/**/!(main).js")
    // Traces all modules and outputs them in the correct order.
    .pipe(amdOptimize("init", {
      paths: {
        jquery: 'bower_components/jquery/dist/jquery.min',
        d3: 'bower_components/d3/d3.min'
      },
      exclude: ['d3', 'jquery']
    }))
    .pipe(addsrc.append("src/dist/main.js"))
    .pipe(concat("main.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task("lib", function () {
  return gulp.src([
    'bower_components/requirejs/require.js',
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/d3/d3.min.js',
    'bower_components/bootstrap/dist/js/bootstrap.min.js'
  ])
    .pipe(gulp.dest("dist"));
});

gulp.task('minify-css', function () {
  return gulp.src(['src/styles.css', 'bower_components/bootstrap/dist/css/bootstrap.min.css'])
    .pipe(minifyCSS({keepBreaks: true}))
    .pipe(concat("styles.css"))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['scripts', 'lib', 'minify-css'], function () {
  return gulp.src('src/index.html')
    .pipe(htmlreplace({
      css: 'styles.css',
      js: {
        src: [['main', 'require.js']],
        tpl: '<script data-main="%s" src="%s"></script>'
      },
      libjs: ['jquery.min.js', 'bootstrap.min.js']
    }))
    .pipe(gulp.dest('dist'));
});