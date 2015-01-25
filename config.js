module.exports = {
  port: 80,
  distPort: 3000,
  src: './src',
  loader: '/lib/parallel-require.js',
  paths: {
    'jquery': '/lib/jquery.min.js',
    'Q': '/lib/Q.js',
    'filters': '/lib/cjs/filters.js',
    'utils': '/lib/cjs/utils.js'
  },
  realPaths: {
    'jquery': 'http://pub.idqqimg.com/guagua/qiqiclient/js/lib/jquery-1.11.0.min.js'
  }
};
