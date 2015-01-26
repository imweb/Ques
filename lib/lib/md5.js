module.exports = function () {
  'use strict';
  var map = require('map-stream')
    , crypto = require('crypto')
    , path = require('path');

  function cal(file, fileMap, cb) {
    var md5 = crypto.createHash('md5')
      , hex;
    md5.update(file.contents, 'utf8');
    hex = md5.digest('hex').slice(0, 5);
    file.path = file.path.replace(/\.([^\.]+)$/, function (all, postfix) {
      var filename = path.basename(file.path);
      fileMap[filename] = filename.replace(/\.([^\.]+)$/, '.' + hex + '.$1');
      return ['', hex, postfix].join('.');
    });
    cb(file);
  }

  function md5() {
    var fileMap = {};
    var stream = map(function (file, cb) {
      if (file.isNull()) {
        return cb(null, file);
      }

      if (file.isBuffer()) {
        cal(file, fileMap, function (file) {
          cb(null, file);
        });
        return;
      }

      if (file.isStream()) {
        throw new PluginError('Dwarf', 'Streams are not supported!');
      }
    });
    stream.fileMap = fileMap;

    return stream;
  }

  return md5;
}();
