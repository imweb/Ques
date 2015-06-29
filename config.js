module.exports = {
  // app listen port
  port: 80,
  // dist app listen port
  distPort: 3000,
  // source path
  src: './src',
  // web server proxy path: so you can use http://localhost/dev
  proxyPath: '/dev',
  // loader path
  loader: '/lib/parallel-require.js',
  // cdn url, for example http://cdn.com/ ->
  // js url: http://cdn.com/js/
  // css url: http://cdn.com/css/
  // image url: http://cdn.com/img/
  cdn: undefined,
  // which files need to build
  // (files: '*') -> means all *.html in src
  // (files: ['index.html']) -> means just build index.html
  files: ['client.html', 'index.html', 'clickNChange.html', 'test.html', 'todomvc.html'],
  // cssnext config, see http://cssnext.io/usage/
  cssnext: {
    browsers: ['> 1%', 'IE 8']
  },
  // loader paths config in development
  paths: {
    'jquery': '/lib/jquery.min',
    'Q': '/lib/bower_components/q.js/dist/Q',
    'filters': '/lib/cjs/filters',
    'utils': '/lib/cjs/utils'
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

  // file config
  'test.html': {
    loader: '/lib/require.min.js'
  }
};
