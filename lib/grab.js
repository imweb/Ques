var get = require('./utils/get')
  , cheerio = require('cheerio')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , each = require('each-series')
  , parallel = require('run-parallel')
  , gulp = require('gulp')
  , map = require('map-stream')
  , config = require('../config')
  , merge = require('utils-merge')
  , md5 = require('./utils/md5')
  , TagSet = require('./utils/tagSet');

var callbacks = {}
  , uid = 0;

function multiPipe(g, stream) {
  if (stream) {
    if (!stream.hasBind) {
      stream.hasBind = true;
      stream.pipe(map(function (file) {
        var uid = file.uid;
        if (uid) {
          callbacks[uid](null, file);
          callbacks[uid] = null;
          delete callbacks[uid];
        }
      }));
    }

    g.pipe(map(function (file, cb) {
      callbacks[++uid] = cb;
      file.uid = uid;
      stream.write(file);
    }));
  }
  return g;
}

function Externals() {
  this.map = {};
  this.externals = [];
}
Externals.prototype.push = function (name) {
  if (!this.map[name]) {
    this.map[name] = true;
    this.externals.push(name);
  }
}
Externals.prototype.get = function () {
  return this.externals;
}

function buildJS(jses, urlMap, externals, host, cb) {
  externals = externals || new Externals();
  var res = [];
  each(jses, function (js, i, done) {
    var isLib = js.indexOf('http://') === -1
      , jsUrl = isLib ?
        url.resolve(host, config.paths[js] + '.js') :
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
              if (config.realPaths[dep]) externals.push(dep);
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

          buildJS(deps, urlMap, externals, host, function (_res) {
            res.push.apply(res, _res);
            !isLib &&
              (body = body.replace(/define\(/, "define('" + urlMap[js] + "', "));
            res.push(body);
            done();
          });
        }
      });
  }, function () {
    cb(res, externals.get());
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
  this.loader = options.loader || '/lib/parallel-require.js';
  this.finishedMap = { 'html': false, 'js': false, 'css': false };
  this.finishedCbs = { 'html': [], 'js': [], 'css': [] };
  this.cb = undefined;
  this.pipes = {
    html: undefined,
    js: undefined,
    css: undefined
  };

  this.cssPath = url.resolve(this.cdn, 'css/' + this.name + '.css');
  this.jsPath = this.cdn === './' ?
    './js/' + this.name + '.js' :
    url.resolve(this.cdn, 'js/' + this.name + '.js');

  process.nextTick(function () {
    get(url.resolve(host, path))
      .on('body', function (body) {
        self._analyse(
          cheerio.load(body)
        );
      });
  });
};
p.output = function (path) {
  this.dist = path;
  return this;
};
p.done = function (cb) {
  this.cb = cb;
  return this;
};
p.pipe = function (name, stream) {
  if (!this.pipes[name]) {
    this.pipes[name] = stream;
  } else {
    this.pipes[name].pipe(stream);
  }
  return this;
}
p._finish = function (name, args) {
  var map = this.finishedMap
    , args = [].slice.call(arguments, 0)
    , self = this;

  // shift the first argument
  args.shift();

  if (!map[name]) {
    map[name] = true;
    this.finishedCbs[name].forEach(function (cb) {
      cb.apply(self, args)
    });
  }
  Object.keys(this.finishedMap)
    .filter(function (key) {
      return !map[key];
    }).length === 0 &&
      this.cb && this.cb();
};
p._when = function (name, cb) {
  this.finishedCbs[name].push(cb);
};
p._analyse = function ($) {
  var csses = []
    , paths
    , self = this;
  $('link[rel=stylesheet]').each(function (i, ele) {
    csses.push(
      url.resolve(self.host, $(ele).attr('href'))
    );
  }).remove();
  $('script').each(function (i, item) {
    item = $(item);
    if (item.attr('src') && !(~self.loader.indexOf('http'))) {
      item.replaceWith('<script>' + fs.readFileSync(path.join(self.src, self.loader)) + '</script>');
    } else if (item.attr('config')) {
      item.remove();
    } else if (item.attr('main')) {
      item.remove();
      self._packJS(item.html());
    }
  });

  parallel([
    function (done) {
      self._when('css', function (value) {
        var file = self.name + '.css';
        $('head').append(
          '<link rel="stylesheet" href="{{path}}">'
            .replace(/\{\{path\}\}/, self.cssPath.replace(file, value[file]))
        );
        done();
      });
    },
    function (done) {
      self._when('js', function (value, externals) {
        var file = self.name + '.js'
          , deps = ['main'];

        deps.unshift.apply(deps, externals);

        paths = JSON.parse(JSON.stringify(config.realPaths));
        paths.main = self.jsPath.replace(file, value[file].replace(/\.js$/, ''));

        $('body').append(
          '<script>{{script}}</script>'
            .replace(/\{\{script\}\}/, [
              'require.config({ paths: ' + JSON.stringify(paths) + ' });',
              "require(" + JSON.stringify(deps) + ", function () {});"
            ].join('\n'))
        );
        done();
      });
    }
  ], function () {
    self._packHTML($);
  });

  this._packCSS(csses);
};
p._packHTML = function ($) {
  var self = this;
  multiPipe(
    gulp.src([path.join(self.src, 'index.html')])
      .pipe(map(function (file, cb) {
        file.path = path.resolve(file.base, self.name + '.html');
        file.contents = new Buffer($.html());
        cb(null, file);
      })),
    self.pipes['html']
  ).pipe(gulp.dest(self.dist))
    .on('end', function () {
      self._finish('html');
    });
};
p._packCSS = function (csses) {
  // Remove duplicate
  csses = (new TagSet(csses)).values();
  var res = [], self = this
    , md5Stream = md5();
  each(csses, function (css, i, done) {
    get(css)
      .on('body', function (body) {
        res.push(body);
        done();
      });
  }, function () {
    multiPipe(
      gulp.src([path.join(self.src, 'index.html')])
        .pipe(map(function (file, cb) {
          file.path = path.resolve(file.base, 'css/' + self.name + '.css');
          file.contents = new Buffer(res.join('\n'));
          cb(null, file);
        })),
       self.pipes['css']
    ).pipe(md5Stream)
      .pipe(gulp.dest(self.dist))
      .on('end', function () {
        self._finish('css', md5Stream.fileMap);
      });
  });
};
p._packJS = function (js) {
  var self = this
    , jses
    , depsJs
    , urlMap = merge(JSON.parse(JSON.stringify(config.realPaths)), { require: true, module: true, exports: true })
    , md5Stream = md5();

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

  buildJS(jses, urlMap, undefined, self.host, function (res, externals) {
    res.push([
      "define('main', [" + depsJs.split(', ').map(function (s) { return s.replace(/\.js["']$/, "'"); }).join(', ') + "], function () {",
        "var i = 0, l = arguments.length, factory = arguments[l - 1];",
        'for (; i < l - 2; i++) {',
          "arguments[i].init ? arguments[i].init() : factory('.component-' + (i + 1), arguments[i]);",
        '}',
        'arguments[l - 2].init()',
      '});'
    ].join('\n'));
    multiPipe(
      gulp.src([path.join(self.src, 'index.html')])
        .pipe(map(function (file, cb) {
          file.path = path.resolve(file.base, 'js/' + self.name + '.js');
          file.contents = new Buffer(res.join('\n'));
          cb(null, file);
        })),
      self.pipes['js']
    ).pipe(md5Stream)
      .pipe(gulp.dest(self.dist))
      .on('end', function () {
        self._finish('js', md5Stream.fileMap, externals);
      });
  })

};

/**
 * Grabs
 * @class
 * @param {Array} paths
 * @param {Object} [options]
 */
function Grabs(paths, options) {
  this.name = undefined;
  this.grabs = paths.map(function (path) {
    return new Grab(path, options);
  });
}
var ps = Grabs.prototype;
/**
 * ouput
 * @param {String} path
 * @returns {Grabs}
 */
ps.output = function (path) {
  this.grabs.forEach(function (grab) {
    grab.output(path);
  });
  return this;
};
/**
 * done
 * @param {Function} cb
 * @returns {Grabs}
 */
ps.done = function (cb) {
  var l = this.grabs.length;
  this.grabs.forEach(function (grab) {
    grab.done(function () {
      if (--l <= 0) cb();
    });
  });
  return this;
};
/**
 * suffix
 * @param {String} suffix
 * @returns {Grabs}
 */
ps.suffix = function (suffix) {
  this.name = suffix;
  return this;
};
/**
 * pipe
 * @param {Stream} stream
 * @returns {Grabs}
 */
ps.pipe = function (stream) {
  if (!this.name) throw new Error('You should use .suffix first');
  var self = this;
  this.grabs.forEach(function (grab) {
    grab.pipe(self.name, stream);
  });
  return this;
};

module.exports = function (path, options) {
  Array.isArray(path) || (path = [path]);
  return new Grabs(path, options);
}
