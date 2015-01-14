module.exports = {
  port: 80,
  src: './src',
  loader: '/lib/parallel-require.js',
  paths: {
    'jquery': '/lib/jquery.min.js',
    'Q': '/lib/Q.js',
    'filters': '/lib/cjs/filters.js'
  }
};
