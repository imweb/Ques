var get = require('./get')
  , cheerio = require('cheerio')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , each = require('each-series')
  , gulp = require('gulp')
  , map = require('map-stream')
  , config = require('../config')
  , merge = require('utils-merge')
  , uglify = require('gulp-uglify')
  , htmlmin = require('gulp-htmlmin')
  , cssmin = require('gulp-minify-css');

function buildJS(jses, urlMap, host, cb) {
  var res = [];
  each(jses, function (js, i, done) {
    var isLib = js.indexOf('http://') === -1
      , jsUrl = isLib ?
        url.resolve(host, config.paths[js]) :
          js;

    get(jsUrl)
      .on('body', function (body) {

        var deps = body
          .match(/define\(\[(.+?)\]/);

        if (deps) {
          deps = deps[1]
            .split(/ *\, */)
            .map(function (dep) {
              return dep.replace(/[\\'|\\"]/g, '');
            })
            .filter(function (dep) {
              return !urlMap[dep];
            });
        }

        if (!deps || !deps.length || isLib) {
          !isLib &&
           (body = body.replace(/define\(/, "define('" + urlMap[js] + "', "));
          res.push(body);
          done();
        } else {
          deps = deps.map(function (dep) {
            var res = config.paths[dep];
            if (res) {
              res = url.resolve(host, res);
              urlMap[dep] = res.replace(host, '.');
              return dep;
            } else {
              res = url.resolve(js, dep) + '.js';
              urlMap[res] = res.replace(host, '.').replace(/\.js$/, '');
              return res;
            }
          });

          buildJS(deps, urlMap, host, function (_res) {
            res.push.apply(res, _res);
            !isLib &&
              (body = body.replace(/define\(/, "define('" + urlMap[js] + "', "));
            res.push(body);
            done();
          });
        }
      });
  }, function () {
    cb(res);
  });
}

function Grab(path, options) {
  this._init(path, options);
}
var p = Grab.prototype;
p._init = function (path, options) {
  options = options || {};
  var host = this.host = options.host || 'http://localhost'
    , self = this;

  this.name = options.name || path.match(/(\w+)\.html$/)[1];
  this.src = options.src || './src';
  this.cdn = options.cdn || './';
  this.loader = options.loader || 'src/lib/parallel-require.js';
  this.cb = undefined;
  this.finishedMap = { 'html': false, 'js': false, 'css': false };

  this.cssPath = url.resolve(this.cdn, 'css/' + this.name + '.css');
  this.jsPath = this.cdn === './' ?
    './js/' + this.name + '.js' :
    url.resolve(this.cdn, 'js/' + this.name + '.js');

  get(url.resolve(host, path))
    .on('body', function (body) {
      self.analyse(
        cheerio.load(body)
      );
    });
};
p.output = function (path) {
  this.dist = path;
  return this;
};
p.done = function (cb) {
  this.cb = cb;
  return this;
}
p.finish = function (name) {
  var map = this.finishedMap;
  map[name] = true;
  Object.keys(this.finishedMap)
    .filter(function (key) {
      return !map[key];
    }).length === 0 &&
      this.cb && this.cb();
}
p.analyse = function ($) {
  var csses = []
    , paths
    , self = this;
  $('link[rel=stylesheet]').each(function (i, ele) {
    csses.push(
      url.resolve(self.host, $(ele).attr('href'))
    );
  }).remove();
  $('head').append(
    '<link rel="stylesheet" href="{{path}}">'
      .replace(/\{\{path\}\}/, this.cssPath)
  );
  $('script').each(function (i, item) {
    item = $(item);
    if (item.attr('src')) {
      item.replaceWith('<script>' + fs.readFileSync(self.loader) + '</script>');
    } else if (item.attr('config')) {
      item.remove();
    } else if (item.attr('main')) {
      item.remove();
      self.packJS(item.html());
    }
  });

  paths = JSON.parse(JSON.stringify(config.realPaths));
  paths.main = this.jsPath;

  $('body').append(
    '<script>{{script}}</script>'
      .replace(/\{\{script\}\}/, [
        'require.config({ paths: ' + JSON.stringify(paths) + ' });',
        "require(['main'], function () {});"
      ].join('\n'))
  );
  gulp.src([path.join(self.src, 'index.html')])
    .pipe(map(function (file, cb) {
      file.path = path.resolve(file.base, self.name + '.html');
      file.contents = new Buffer($.html());
      cb(null, file);
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest(self.dist))
    .on('end', function () {
      self.finish('html');
    });
  this.packCSS(csses);
};
p.packCSS = function (csses) {
  var res = [], self = this;
  each(csses, function (css, i, done) {
    get(css)
      .on('body', function (body) {
        res.push(body);
        done();
      });
  }, function () {
    gulp.src([path.join(self.src, 'index.html')])
      .pipe(map(function (file, cb) {
        file.path = path.resolve(file.base, 'css/' + self.name + '.css');
        file.contents = new Buffer(res.join('\n'));
        cb(null, file);
      }))
      .pipe(cssmin())
      .pipe(gulp.dest(self.dist))
      .on('end', function () {
        self.finish('css');
      });
  });
};
p.packJS = function (js) {
  var self = this
    , jses
    , depsJs
    , urlMap = merge(JSON.parse(JSON.stringify(config.realPaths)), { require: true, module: true, exports: true });
  js.replace(/require\(\[(.+?)\]/, function (match, deps) {
    depsJs = deps;
    jses = deps.split(', ').map(function (dep) {
      dep = dep.replace(/[\\'|\\"]/g, '');
      if (!/\.js$/.test(dep)) dep = dep + '.js';
      var _dep = url.resolve(self.host, dep);
      urlMap[_dep] = dep.replace(/\.js$/, '');
      return _dep;
    });
  });

  buildJS(jses, urlMap, self.host, function (res) {
    res.push([
      "define('main', [" + depsJs.split(', ').map(function (s) { return s.replace(/\.js["']$/, "'"); }).join(', ') + "], function () {",
        'for (var i = 0, l = arguments.length; i < l; i++) {',
          "arguments[i].init && arguments[i].init('.component-' + (i + 1))",
        '}',
      '});'
    ].join('\n'));
    gulp.src([path.join(self.src, 'index.html')])
      .pipe(map(function (file, cb) {
        file.path = path.resolve(file.base, 'js/' + self.name + '.js');
        file.contents = new Buffer(res.join('\n'));
        cb(null, file);
      }))
      .pipe(uglify())
      .pipe(gulp.dest(self.dist))
      .on('end', function () {
        self.finish('js');
      });
  })

};

module.exports = function (path, options) {
  return new Grab(path, options);
}
