var TagSet = require('../utils/tagSet')
  , comDeps = {};

exports = module.exports = function (name) {
  return (comDeps[name] = comDeps[name] || new TagSet());
};
exports.reset = function (name) {
  return (comDeps[name] = new TagSet());
};
exports.has = function (name) {
  return !!comDeps[name];
};
