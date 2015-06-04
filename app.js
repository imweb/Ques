var connect = require('connect')
  , middlePipe = require('middleware-pipe')
  , path = require('path')
  , ques = require('./lib/ques')
  , config = require('./lib/appConfig')(require('./config'))
  , src = path.resolve(config.src);

var app = connect();

config.addon &&
  config.addon.forEach(function (addon) {
    addon = require('./addon/' + addon);
    addon.init ?
      addon.init(app) :
      addon.router ?
        app.use(addon.router, addon.middleware) :
        app.use(addon);
  });

app.use(
    '/lib',
    middlePipe(src + '/lib', /(\.js)$/)
      .pipe(ques.js(true))
  )
  .use(
    '/lib',
    middlePipe(src + '/lib')
  )
  .use(
    '/components',
    middlePipe(src + '/components', /(\.html\.js)$/, function (url) {
      return url.replace(/\.js$/, '');
    }).pipe(ques.tpl())
  )
  .use(
    '/components',
    middlePipe(src + '/components', /\.js$/)
      .pipe(ques.js(false, true))
  )
  .use(
    '/components',
    middlePipe(src + '/components', /\.css$/)
      .pipe(ques.css())
  )
  .use(
    '/components',
    middlePipe(src + '/components', /render\.js$/, function () {
      return 'render.js';
    }).pipe(ques.js())
  )
  .use(
    '/img',
    middlePipe(src + '/img')
  )
  .use(
    '/pages',
    middlePipe(src + '/pages', /\.js$/)
      .pipe(ques.js())
  )
  .use(
    '/pages',
    middlePipe(src + '/pages', /\.css$/)
      .pipe(ques.css())
  )
  .use(
    middlePipe(src, /\.html$/)
      .pipe(ques.html())
  ).listen(config.port, function () {
    console.log('app listen: ' + config.port);
  });
