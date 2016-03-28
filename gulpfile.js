var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var babel = require("gulp-babel");
var plumber = require("gulp-plumber");

var changed = require('gulp-changed');

var webkitAssign = require('webkit-assign/gulp');

var paths = {
  sass: ['./scss/**/*.scss'],
  es6: ['./jssrc/**/*.js']
};

gulp.task('default', ['webkitbug', 'babel', 'sass']);

gulp.task('webkitbug', function() {
  return gulp.src('./www/lib/ionic/js/ionic.bundle.js')
    .pipe(webkitAssign())
    .pipe(gulp.dest('./www/lib/ionic/js/'));
});

gulp.task('babel', function() {
  var dest = 'www/js/transpiled';
  return gulp.src(paths.es6)
    .pipe(changed(dest))
    .pipe(plumber())
    .pipe(babel({
      plugins: ["transform-async-to-generator", "syntax-object-rest-spread"],
      presets: ['es2015'],
      sourceMaps: 'inline'
    }))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest(dest));
});

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.es6, ['babel']);
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
