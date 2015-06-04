var path = require('path')
  , URL = require('url')
  , fs = require('fs')
  , crypto = require('crypto')
  , postcss = require('postcss')
  , gulp = require('gulp')
  , map = require('map-stream')
  , REG_URL = /url\(\.\.\/\.\.\/img\/(.+)\)/
  , REG_FILE = /([^\/]+)$/
  , REG_PREFIX = /\.(\w+)$/
  , IMG_PATH = path.join(process.cwd(), 'src/img')
  , IMG_DIST_PATH = path.join(process.cwd(), 'dist/img');

function cal(contents, cb) {
  var md5 = crypto.createHash('md5');
  md5.update(contents, 'utf8');
  return md5.digest('hex').slice(0, 5);
}

function fix(opts) {
  opts = opts || {}
  var cache = {}
    , cwd = process.cwd();

  function setUrl(decl, url, file) {
    decl.value = decl.value.replace(REG_URL, 'url(' + url + ')');
    cache[file] = url;
  }

  function processDecl(decl) {
    var file = decl.value.match(REG_URL)[1]
      , url = cache[file]
      , bindary
      , src
      , hex
      , hexFile;

    if (url) {
      setUrl(decl, url, file);
    } else {
      src = path.join(IMG_PATH, file);
      hex = cal(fs.readFileSync(src));
      hexFile = file.replace(REG_PREFIX, '.' + hex + '.$1');
      var _file = file.match(REG_FILE)[1]
        , _hexFile = hexFile.match(REG_FILE)[1];
      gulp.src([src])
        .pipe(map(function (f, fn) {
          f.path = f.path.replace(_file, _hexFile);
          fn(null, f);
        }))
        .pipe(gulp.dest('./dist/img'))
      if (opts.cdn) {
        url = URL.resolve(opts.cdn, 'img/' + _hexFile);
      } else {
        url = '../img/' + _hexFile;
      }
      setUrl(decl, url, file);
    }
  }

  var plugin = postcss.plugin('postcss-fix-url', function (opts) {
    return function (css) {
      css.eachDecl(function (decl) {
        if (decl.value && ~decl.value.indexOf('url(../../img')) {
          processDecl(decl);
        }
      });
    }
  });

  var contenter = postcss().use(plugin());

  return map(function (file, fn) {
    file.contents = new Buffer(
      contenter.process(file.contents.toString()).css
    );
    fn(null, file);
  });
}

module.exports = fix;