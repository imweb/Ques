var ts
  , map = require('map-stream')
  , noop = function () {
    return map(function (file, cb) {
      cb(null, file);
    });
  };

try {
  ts = require('typescript');
} catch(e) {
  ts = null;
}

module.exports = function (config) {
  if (config) {
    if (ts) {
      if (config === true) config = {};

      return map(function (file, cb) {
        file.contents = new Buffer(ts.transpileModule(file.contents.toString(), { fileName: file.path }).outputText);
        cb(null, file);
      });
    } else {
      console.error('Please install typescript first!');
      return noop();
    }
  } else {
    return noop();
  }
}
