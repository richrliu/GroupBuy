/**
 * Module Dependencies
 */

//utilities
var gulp = require('gulp');
var util = require('gulp-util');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');

//js
var jshint = require('gulp-jshint');

//css
var sass = require('gulp-sass')
var postcss = require('gulp-postcss');
var autoprefix = require('autoprefixer');

/**
 * Config
 */

var paths = {
  styles: {
      src: './client/sass/main.scss',
      dest: './client/css',
      watch: './client/sass/**/*.scss'
  },

  scripts: [
    './client/js/*.js',
  ],

  server: [
    './server/bin/www'
  ]
};

var nodemonConfig = {
  script: paths.server,
  ext: 'html js css',
  ignore: ['node_modules']
};


/**
 * Bundlers
 */

function bundleCSS() {
    var processors = [
        autoprefix({browsers: ['last 2 versions']}),
    ];

    var rebundle = function() {
        util.log(util.colors.blue('---------- CSS Bundle Started ----------'));

        return gulp.src(paths.styles.src)
            .pipe(concat('main.scss'))
            .pipe(sass().on('error', sass.logError))
            .pipe(postcss(processors))
            .pipe(rename('main.css'))
            .pipe(gulp.dest(paths.styles.dest))
            .pipe(notify(function() {
                util.log(util.colors.blue('CSS'), 'rebundle finished');
            }));
    }

    gulp.watch(paths.styles.watch, rebundle);

    return rebundle();
}

/**
 * Gulp Tasks
 */

gulp.task('rebuild', function() {
    bundleCSS();
});

gulp.task('lint', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('browser-sync', ['nodemon'], function(done) {
  browserSync({
    proxy: "localhost:3000",  // local node app address
    port: 5000,  // use *different* port than above
    notify: true
  }, done);
});

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon(nodemonConfig)
  .on('start', function () {
    if (!called) {
      called = true;
      cb();
    }
  })
  .on('restart', function () {
    setTimeout(function () {
      reload({ stream: false });
    }, 1000);
  });
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['lint']);
});

gulp.task('default', ['rebuild', 'browser-sync', 'watch'], function(){});
