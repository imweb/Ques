module.exports = {
  // app listen port
  port: 80,
  // dist app listen port
  distPort: 3000,
  // use babel to support es6
  babel: false,
  // source path
  src: './src',
  // web server proxy path: so you can use http://localhost/dev
  proxyPath: '/dev',
  // loader path
  // if loader is local file, it will just inline
  loader: 'http://7.url.cn/edu/jslib/requirejs/2.1.6/require.min.js',
  // cdn url, for example http://cdn.com/ ->
  // js url: http://cdn.com/js/
  // css url: http://cdn.com/css/
  // image url: http://cdn.com/img/
  cdn: undefined,
  // which files need to build
  // (files: '*') -> means all *.html in src
  // (files: ['index.html']) -> means just build index.html
  files: ['index.html', 'todomvc.html', 'client.html', 'components.html'],
  // cssnext config, see http://cssnext.io/usage/
  cssnext: {
    browsers: ['> 1%', 'IE 8']
  },
  // loader paths config in development
  paths: {
    'jquery': '/lib/jquery.min',
    'Q.core': '/lib/bower_components/q.js/dist/Q',
    'Q': '/lib/Q',
    'third': '/lib/third',
    'filters': '/lib/cjs/filters',
    'utils': '/lib/cjs/utils',
    'db.core': '/lib/db.core',
    'db': '/lib/db',
    'db.feeder': '/lib/feeder',
    'marked': '/lib/marked',
    'error.log': '/lib/error.log'
  },
  // loader paths config in real world
  realPaths: {
    'jquery': 'http://pub.idqqimg.com/guagua/qiqiclient/js/lib/jquery-1.11.0.min'
  },
  shim: {
    // some shim
  },
  // feature flag
  disabled: {
    // for example
    // ttext: true
    // means the ttext component will be disabled
  },

  // jshint config
  jshint: {
    curly: true,
    eqeqeq: true,
    forin: true,
    freeze: true,
    globals: {},
    latedef: true,
    maxerr: 200,
    nonew: true,
    shadow: "inner",
    singleGroups: true,
    undef: true,
    unused: true,

    evil: true,
    expr: true,
    proto: true,
    scripturl: true,
    sub: true,

    devel: true,
    browser: true,
    browserify: true,
    nonstandard: true,
    typed: true,
    worker: true
  },

  // css sprite config
  sprite: {
    // relative to source
    path: './img/flag'
  },

  // file config
  'test.html': {
    loader: '/lib/parallel-require.js'
  }
};
