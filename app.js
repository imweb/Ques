var connect = require('connect')
  , middlePipe = require('middleware-pipe')
  , path = require('path')
  , ques = require('./lib/ques')
  , config = require('./lib/appConfig')(require('./config'))
  , src = path.resolve(config.src)
  , proxy = require('proxy-middleware')
  , typescript = require('./lib/gulp-plugin/typescript');

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
      .pipe(ques.js())
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
      .pipe(typescript(config.typescript))
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
      .pipe(typescript(config.typescript))
      .pipe(ques.js())
  )
  .use(
    '/pages',
    middlePipe(src + '/pages', /\.css$/)
      .pipe(ques.css())
  )
  .use(
    middlePipe('./lib/vender', /^\/\?/, function (url) {
      return url.replace(/^\/\?/, '/default.html?');
    })
      .pipe(ques.control())
      .pipe(ques.html())
  )
  .use(
    middlePipe(src, /(\.html$)|(\.html\?(.+))/, function(url) {
      return url.replace(/\?([\s\S]*)/, '');
    })
      .pipe(ques.html())
  )
  .use(config.proxyPath, proxy('http://127.0.0.1:' + config.port + '/'))
  .listen(config.port, function () {
    console.log('app listen: ' + config.port);
  });
