module.exports = {
  port: 80,
  src: './src',
  loader: '/lib/parallel-require.js',
  paths: {
    'jquery': '/lib/jquery.min.js',
    'Q': '/lib/Q.js',
    'filters': '/lib/cjs/filters.js',
    'utils': '/lib/cjs/utils.js',
    'commonapi': '/lib/commonapi.js',
    'jquery.contextMenu': '/lib/jquery.contextMenu.js'
  },
  realPaths: {
    'jquery': 'http://pub.idqqimg.com/guagua/qiqiclient/js/lib/jquery-1.11.0.min.js',
    'commonapi': '/lib/commonapi.js',
    'jquery.contextMenu': '/lib/jquery.contextMenu.js'
  }
};
