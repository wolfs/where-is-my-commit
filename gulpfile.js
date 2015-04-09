var gulp = require("gulp"),
  amdOptimize = require("gulp-amd-optimize"),
  concat = require('gulp-concat'),
  copy = require('gulp-contrib-copy'),
  htmlreplace = require('gulp-html-replace'),
  minifyCSS = require('gulp-minify-css');

gulp.task("scripts", function () {
  return gulp.src("src/**/*.js")
    // Traces all modules and outputs them in the correct order.
    .pipe(amdOptimize("init", {
      paths: {
        jquery: 'bower_components/jquery/dist/jquery.min',
        d3: 'bower_components/d3/d3.min'
      }
    }))
    .pipe(concat("main.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task("lib", function () {
  return gulp.src('bower_components/requirejs/require.js')
    .pipe(copy())
    .pipe(gulp.dest("dist"));
});

gulp.task('minify-css', function () {
  return gulp.src(['src/styles.css', 'bower_components/bootstrap/dist/css/bootstrap.min.css'])
    .pipe(minifyCSS({keepBreaks: true}))
    .pipe(concat("styles.css"))
    .pipe(gulp.dest('dist'))
});

gulp.task('build', ['scripts', 'lib', 'minify-css'], function () {
  return gulp.src('src/index.html')
    .pipe(htmlreplace({
      css: 'styles.css',
      js: {
        src: [['main', 'require.js']],
        tpl: '<script data-main="%s" src="%s"></script>'
      }
    }))
    .pipe(gulp.dest('dist'));
});