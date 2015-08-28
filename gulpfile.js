var gulp = require("gulp"),
  amdOptimize = require("gulp-amd-optimize"),
  concat = require('gulp-concat'),
  htmlreplace = require('gulp-html-replace'),
  minifyCSS = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  addsrc = require('gulp-add-src'),
  gulpIgnore = require('gulp-ignore'),
  debug = require('gulp-debug'),
  shims = require('./src/shims.js')
;


gulp.task("scripts", function () {
  'use strict';
  shims.exclude = ['d3', 'jquery', 'bootstrap'];
  return gulp.src(["src/**/*.js", "!src/**/shims.js"])
    .pipe(amdOptimize("main", shims))
    .pipe(gulpIgnore.exclude('**/main.js'))
    .pipe(addsrc.append("src/shims.js"))
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
  return gulp.src(['src/index.html', 'src/broken.html'])
    .pipe(htmlreplace({
      css: 'styles.css',
      js: ['require.js', 'main.js']
    }))
    .pipe(gulp.dest('dist'));
});