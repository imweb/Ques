var connect = require('connect')
  , middlePipe = require('middleware-pipe')
  , path = require('path')
  , qiqi = require('./lib/qiqi')
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
    '/lib/cjs',
    middlePipe(src + '/lib/cjs')
      .pipe(qiqi.js(true))
  )
  .use(
    '/lib',
    middlePipe(src + '/lib')
  )
  .use(
    '/components',
    middlePipe(src + '/components', /(\.html\.js)|(\.css\.js)$/, function (url) {
      return url.replace(/\.js$/, '');
    }).pipe(qiqi.tpl())
  )
  .use(
    '/components',
    middlePipe(src + '/components', /\.js$/)
      .pipe(qiqi.js())
  )
  .use(
    '/components',
    middlePipe(src + '/components', /\.css$/)
      .pipe(qiqi.css())
  )
  .use(
    '/components',
    middlePipe(src + '/components', /render\.js$/, function () {
      return 'render.js';
    }).pipe(qiqi.js())
  )
  .use(
    '/pages',
    middlePipe(src + '/pages', /\.js$/)
      .pipe(qiqi.js())
  )
  .use(
    '/pages',
    middlePipe(src + '/pages', /\.css$/)
      .pipe(qiqi.css())
  )
  .use(
    middlePipe(src, /\.html$/)
      .pipe(qiqi.html())
  ).listen(config.port, function () {
    console.log('app listen: ' + config.port);
  });
