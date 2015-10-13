var babel
  , map = require('map-stream')
  , noop = function () {
    return map(function (file, cb) {
      cb(null, file);
    });
  };

try {
  babel = require('gulp-babel');
} catch(e) {
  babel = null;
}

module.exports = function (config) {
  if (config) {
    if (babel) {
      if (config === true) config = {};
      return babel(config);
    } else {
      console.error('Please install gulp-babel first!');
      return noop()
    }
  } else {
    return noop();
  }
}
