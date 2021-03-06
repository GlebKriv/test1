'use strict';

const sass = require('gulp-sass')(require('sass'));
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const fileinclude = require('gulp-file-include');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const webserver = require('gulp-webserver');
const php = require('gulp-connect-php');
const rimraf = require('rimraf');
const comments = require('gulp-header-comment');

var path = {
  src: {
    html: 'source/*.html',
    others: 'source/*.+(php|ico|png)',
    htminc: 'source/partials/**/*.htm',
    incdir: 'source/partials/',
    plugins: 'source/plugins/**/*.*',
    js: 'source/js/*.js',
    scss: 'source/scss/**/*.scss',
    images: 'source/images/**/*.+(png|jpg|gif|svg)'
  },
  build: {
    dirNetlify: 'netlify/',
    dirDev: 'theme/'
  }
};

// HTML
gulp.task('html:build', function () {
  return gulp.src(path.src.html)
    .pipe(fileinclude({
      basepath: path.src.incdir
    }))
    .pipe(comments(`
    WEBSITE: https://themefisher.com
    TWITTER: https://twitter.com/themefisher
    FACEBOOK: https://www.facebook.com/themefisher
    GITHUB: https://github.com/themefisher/
    `))
    .pipe(gulp.dest(path.build.dirDev))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// SCSS
gulp.task('scss:build', function () {
  return gulp.src(path.src.scss)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('/'))
    .pipe(comments(`
    WEBSITE: https://themefisher.com
    TWITTER: https://twitter.com/themefisher
    FACEBOOK: https://www.facebook.com/themefisher
    GITHUB: https://github.com/themefisher/
    `))
    .pipe(gulp.dest(path.build.dirDev + 'css/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Javascript
gulp.task('js:build', function () {
  return gulp.src(path.src.js)
    .pipe(comments(`
  WEBSITE: https://themefisher.com
  TWITTER: https://twitter.com/themefisher
  FACEBOOK: https://www.facebook.com/themefisher
  GITHUB: https://github.com/themefisher/
  `))
    .pipe(gulp.dest(path.build.dirDev + 'js/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Images
gulp.task('images:build', function () {
  return gulp.src(path.src.images)
    .pipe(gulp.dest(path.build.dirDev + 'images/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Plugins
gulp.task('plugins:build', function () {
  return gulp.src(path.src.plugins)
    .pipe(gulp.dest(path.build.dirDev + 'plugins/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('php', function() {
    connectPHP.server({
        base: "src",
        port: 8010,
        hostname:"0.0.0.0",
        keepalive: true
    });
});

//Apply and configure BrowserSync on Port 8080 to proxy the php instance on Port 8010
gulp.task('browser-sync',['php'], function() {
    browserSync.init({
        proxy: '127.0.0.1:8010',
        port: 8080,
        open: true,
        notify: false
    });
});

// Other files like favicon, php, sourcele-icon on root directory
gulp.task('others:build', function () {
  return gulp.src(path.src.others)
    .pipe(gulp.dest(path.build.dirDev))
});

// Clean Build Folder
gulp.task('clean', function (cb) {
  rimraf('./theme', cb);
});

// Watch Task
gulp.task('watch:build', function () {
  gulp.watch(path.src.html, gulp.series('html:build'));
  gulp.watch(path.src.htminc, gulp.series('html:build'));
  gulp.watch(path.src.scss, gulp.series('scss:build'));
  gulp.watch(path.src.js, gulp.series('js:build'));
  gulp.watch(path.src.images, gulp.series('images:build'));
  gulp.watch(path.src.plugins, gulp.series('plugins:build'));
});


gulp.task('webserver', function() {
  gulp.src('app')
    .pipe(webserver({
      port: 3000,
      livereload: true,
      directoryListing: true,
      host: '0.0.0.0'
    }));
});


gulp.task('browser-sync', function () {
  browserSync({
    logPrefix: 'Your Project',
    host: 'site1.domain.dev',
    port: 3060,
    open: false,
    notify: false,
    ghost: false,

    // Change this property with files of your project
    // that you want to refresh the page on changes.
    files: [
      'public/css/**.min.css',
      'public/js/**.min.js',
      'app/**/*.php',
      'index.php',
      '.htaccess'
    ]
  });
});

function watch() {
   browserSync.init({
      server: {
         baseDir: './src/'
      }
   });
   gulp.watch('./src/assets/sass/**/*.scss', style);
   gulp.watch(['./src/assets/js/**/*.js','!./src/assets/js/main.js'], concatjs);
   gulp.watch('./src/**/*.html').on('change', browserSync.reload);
   gulp.watch('./src/**/*.php').on('change', browserSync.reload);
}
exports.watch = watch;

// Build Task
gulp.task('default', gulp.series(
  'clean',
  'html:build',
  'js:build',
  'scss:build',
  'images:build',
  'plugins:build',
  'others:build',
  gulp.parallel(
    'watch:build',
    function () {
      browserSync.init({
        server: {
          baseDir: path.build.dirDev,
          open: false,
        }
      });
    })
  )
);


/* =====================================================
Netlify Builds
===================================================== */
// HTML
gulp.task('html:netlify:build', function () {
  return gulp.src(path.src.html)
    .pipe(fileinclude({
      basepath: path.src.incdir
    }))
    .pipe(gulp.dest(path.build.dirNetlify));
});

// SCSS
gulp.task('scss:netlify:build', function () {
  return gulp.src(path.src.scss)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('/maps'))
    .pipe(gulp.dest(path.build.dirNetlify + 'css/'));
});

// Javascript
gulp.task('js:netlify:build', function () {
  return gulp.src(path.src.js)
    .pipe(gulp.dest(path.build.dirNetlify + 'js/'));
});

// Images
gulp.task('images:netlify:build', function () {
  return gulp.src(path.src.images)
    .pipe(gulp.dest(path.build.dirNetlify + 'images/'));
});

// Plugins
gulp.task('plugins:netlify:build', function () {
  return gulp.src(path.src.plugins)
    .pipe(gulp.dest(path.build.dirNetlify + 'plugins/'))
});

// Other files like favicon, php, apple-icon on root directory
gulp.task('others:netlify:build', function () {
  return gulp.src(path.src.others)
    .pipe(gulp.dest(path.build.dirNetlify))
});

// Other files like favicon, php, apple-icon on root directory
gulp.task('browserSync:netlify:build', function () {
  return gulp.src(path.src.others)
    .pipe(gulp.dest(path.build.dirNetlify))
});

// Other files like favicon, php, apple-icon on root directory
gulp.task('webserver:netlify:build', function () {
  return gulp.src(path.src.others)
    .pipe(gulp.dest(path.build.dirNetlify))
});

// Build Task
gulp.task('netlify', gulp.series(
  'html:netlify:build',
  'js:netlify:build',
  'scss:netlify:build',
  'images:netlify:build',
  'plugins:netlify:build',
  'browserSync:netlify:build',
  'webserver:netlify:build'
));
