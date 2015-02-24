var DEFAULT = require('../../config')
  , src = DEFAULT.src
  , path = require('path')
  , merge = require('utils-merge');

function _extendConfig(config) {
  config.loader = config.loader || DEFAULT.loader;
  config.paths =
    merge(
      merge({}, DEFAULT.paths),
      config.paths || {}
    );
  config.realPaths =
    merge(
      merge({}, DEFAULT.realPaths),
      config.realPaths || {}
    );
  config.disabled =
    merge(
      merge({}, DEFAULT.disabled),
      config.disabled || {}
    );
  return config;
}

exports = module.exports = function (file) {
  if (!file) return DEFAULT;
  file = path.relative(src, file);
  if (!exports[file] && DEFAULT[file]) {
    exports[file] = _extendConfig(DEFAULT[file]);
  }
  return exports[file] || DEFAULT;
};
exports.src = path.resolve(src);
