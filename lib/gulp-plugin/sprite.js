var spritesmith
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , map = require('map-stream')
  , crypto = require('crypto')
  , config = require('../utils/config')()
  , PNG_REG = /\.png$/
  , RESULT_NAME = /(\w+)$/
  , URL_REG = /background(\-image)?\: *url\((['"]?)(.+?)\2?\)( no-repeat)*/g;

try {
  spritesmith = require('spritesmith');
} catch(e) {
  spritesmith = null;
}

var LazyBuilder = {
  // default is null
  properties: null,
  // default is null
  path: null,
  // default is null
  filePath: null,
  // default is null
  name: null,
  // default is null
  result: null,
  cbs: [],
  _wrap: function (file, cb) {
    var self = this;
    var handle = function () {
      var name = this.name
        , result = this.result
        , filePath = this.filePath
        , shouldPath = this.path
        , properties = this.properties;

      var content = file.contents.toString();

      content = content.replace(URL_REG, function (all, $1, $2, $3) {
        if (~$3.indexOf(shouldPath)) {
          var i = $3.indexOf(shouldPath)
            , key = path.join(filePath, $3.slice(i + shouldPath.length + 1)).replace(/\\/g, '/')
            , data = result[key];

          return [
            'background-image: url("' + url.resolve(config.cdn || '', 'img/' + name) + '");',
            'background-position: -' + data.x + 'px -' + data.y + 'px;',
            'background-size: ' + properties.width + 'px auto'
          ].join('\n');
        }
        return all;
      });

      file.contents = new Buffer(content);
      cb(null, file);
    };
    return function () {
      handle.call(self);
    };
  },
  done: function (name, result, properties) {
    this.name = name
    this.result = result;
    this.properties = properties;
    this.cbs.forEach(function (cb) {
      cb();
    });
  },
  build: function (file, cb) {
    var wrap = this._wrap(file, cb);
    if (this.result) {
      // just call
      wrap();
    } else {
      // async call
      this.cbs.push(wrap);
    }
  }
}

if (spritesmith) {
  module.exports = function (param) {
    // file path
    var filePath = path.join(config.src, param.path).replace(/\\/g, '/')
      , shouldPath = path.join('../', param.path).replace(/\\/g, '/')
      , name = [RESULT_NAME.exec(param.path)[1]]
      , files = fs.readdirSync(filePath).filter(function (em) {
        return !!PNG_REG.test(em);
      }).map(function (file) {
        return filePath + '/' + file;
      });

    LazyBuilder.filePath = filePath;
    LazyBuilder.path = shouldPath;

    spritesmith({
      src: files
    }, function (err, result) {
      // throw err
      if (err) throw err;

      var md5 = crypto.createHash('md5');
      md5.update(result.image, 'binary');

      name.push(md5.digest('hex').slice(0, 11), 'png');

      LazyBuilder.done(name.join('.'), result.coordinates, result.properties);

      if (!fs.existsSync('./dist')) {
        fs.mkdirSync('./dist');
      }
      // fixed if dist/img is no exist
      if (!fs.existsSync('./dist/img')) {
        fs.mkdirSync('./dist/img');
      }

      // TODO hard code
      fs.writeFile(path.join('./dist/img', name.join('.')), result.image, 'binary');
    })


    var stream = map(function (file, fn) {
      LazyBuilder.build(file, fn);
    });

    // just ignore possible EventEmitter memory leak detected.
    stream.setMaxListeners(0);
    return stream;
  };
} else {
  module.exports = function (param) {
    if (param.path) {
      throw new Error('Please install spritesmith first');
    }

    // nothing to do
    return map(function (file, fn) {
      fn(null, file);
    });
  };
}
