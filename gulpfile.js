var gulp = require('gulp')
  , spawn = require('child_process').spawn
  , grab = require('./lib/grab')
  , config = require('./config')
  , cssmin = require('gulp-minify-css')
  , htmlmin = require('gulp-htmlmin')
  , uglify = require('gulp-uglify');

var app;

/**
 * createApp(done, port)
 * createApp(done, opt)
 * @param {Function} done finish callback
 * @param {Number} port listen port
 * @param {Object} opt options
 */
function createApp(done, opt) {
  typeof opt === 'number' &&
    (opt = { port: opt });
  opt || (opt = {});

  var args = ['app']
    , hasInit = false
    , port = opt.port;

  if (port) args.push('-p', port);
  if (opt.args) args.push.apply(args, opt.args);

  app = spawn('node', args)
    .on('close', function () {
      console.log('app close');
    });

  app.stdout.on('data', function (data) {
    if (!hasInit) (hasInit = true) && done();
    console.log(data.toString());
  });
}

// dev app task
gulp.task('app', function (done) {
  createApp(done);
});

// dist app task
gulp.task('distApp', function (done) {
  createApp(done, config.distPort);
});

gulp.task('learn', function (done) {
  createApp(done, {
    port: 3000,
    args: ['-a', 'learn']
  });
});

// build task
gulp.task('default', ['distApp'], function () {
  // files need to be grab
  grab(['todomvc.html', 'client.html', 'index.html'], {
    host: 'http://localhost:' + config.distPort
  }).output('./dist')
    // gulp stream for css
    .suffix('css')
    .pipe(cssmin())
    // gulp stream for html
    .suffix('html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyJS: true,
      minifyCSS: true
    }))
    // gulp stream for js
    .suffix('js')
    .pipe(uglify())
    .done(function () {
      process.exit(0);
    });
});

// if process is exit, kill the app
process.on('exit', function(code) {
  process.kill(app.pid)
});
