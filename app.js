var connect = require('connect')
  , middlePipe = require('middleware-pipe')
  , qiqi = require('./gulp/qiqi');

connect()
  .use(
    '/components',
    middlePipe(__dirname + '/components', /\.js$/)
      .pipe(qiqi.js())
  )
  .use(
    '/components',
    middlePipe(__dirname + '/components', /\.css$/)
      .pipe(qiqi.css())
  )
  .use(
    middlePipe(__dirname, /\.html$/)
      .pipe(qiqi.html())
  )
  .listen(3000);