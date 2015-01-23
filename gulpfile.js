var gulp = require('gulp')
  , spawn = require('child_process').spawn
  , grab = require('./lib/grab');

var app;

gulp.task('app', function (done) {
  app = spawn('node', ['app'])
    .on('close', function () {
      console.log('app close');
    });
  done();
});

gulp.task('default', ['app'], function () {
  grab('client.html')
    .output('./dist')
    .done(function () {
      console.log('done');
      app.kill(0);
      process.exit(0);
    });
});
