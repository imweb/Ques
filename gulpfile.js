var gulp = require('gulp')
  , spawn = require('child_process').spawn
  , grab = require('./lib/grab')
  , config = require('./config')
  , cssmin = require('gulp-minify-css')
  , htmlmin = require('gulp-htmlmin')
  , uglify = require('gulp-uglify');

var app;

function createApp(done, port) {
  var args = ['app'], hasInit = false;
  if (port) args.push('-p', port);
  app = spawn('node', args)
    .on('close', function () {
      console.log('app close');
    });

  app.stdout.on('data', function (data) {
    if (!hasInit) (hasInit = true) && done();
  });
}

gulp.task('app', function (done) {
  createApp(done);
});

gulp.task('distApp', function (done) {
  createApp(done, config.distPort);
});

gulp.task('default', ['distApp'], function () {
  grab('todomvc.html', {
    host: 'http://localhost:3000'
  }).output('./dist')
    // gulp stream for css
    .pipe('css', cssmin())
    // gulp stream for html
    .pipe('html', htmlmin({
      collapseWhitespace: true,
      minifyJS: true,
      minifyCSS: true
    }))
    // gulp stream for js
    .pipe('js', uglify())
    .done(function () {
      console.log('done');
      process.exit(0);
    });
});

process.on('exit', function(code) {
  process.kill(app.pid)
});
