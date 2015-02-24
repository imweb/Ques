module.exports = {
  // app listen port
  port: 80,
  // dist app listen port
  distPort: 3000,
  // source path
  src: './src',
  // loader path
  loader: '/lib/parallel-require.js',
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
