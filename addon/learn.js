var path = require('path')
  , fs = require('fs')
  , url = require('url')
  , config = require('../config')
  , cwd = process.cwd()
  , middlewarePipe = require('middleware-pipe');

function _getFile(query) {
  if (!query) query = '';
  var file = query.match(/path\=(.+?)(\&|$)/);
  file ?
    (file = file[1]) :
    (file = 'test.html');
  return path.join(cwd, config.src, file);
}

function index(req, res, next, urlObj) {

  var openFile = _getFile(urlObj.query)
    , file = path.resolve(__dirname, 'learn/index.html')
    , test = path.join(cwd)
    , str = fs.readFileSync(file, 'utf-8');

  str = str.replace(
    /\{\{result\}\}/,
    fs.existsSync(openFile) ?
      fs.readFileSync(openFile, 'utf-8')
        .replace(/\r?\n/g, '\\n')
        .replace(/\\'/g, '\\\\\'')
        .replace(/'/g, "\\'")
        .replace(/\<\/script\>/g, "</' + 'script>") :
      ''
  );

  res.writeHead(200, {
    'Content-Type': 'text/html;charset=utf-8'
  });
  res.end(str);
}

function submit(req, res, next, urlObj) {
  var data = [];
  req.on('data', function (chunk) {
    data.push(chunk);
  });
  req.on('end', function () {
    data = Buffer.concat(data);
    fs.writeFileSync(_getFile(urlObj.query), data, 'utf-8');
    res.end();
  });
}

function file(req, res, next, urlObj) {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  var p = decodeURIComponent(urlObj.query.split('=')[1]),
    result = fs.readdirSync(path.resolve(__dirname, '../src/', p))
    .map(function (file) {
      var i = file.lastIndexOf('.');
      if (~i) {
        return [
          '<li class="file ext_' + file.substring(i + 1) + '">',
            '<a href="#" rel="' + p + file + '">' + file + '</a>',
          '</li>'
        ].join('');
      } else {
        return [
          '<li class="directory collapsed">',
            '<a href="#" rel="' + p + file + '/">' + file + '</a>',
          '</li>'
        ].join('');
      }
    });
  result.unshift('<ul class="jqueryFileTree" style="display: none;">');
  result.push('</ul>');
  res.end(result.join(''));
}

var defaultMiddle = middlewarePipe(path.join(__dirname, './learn'));

function middleware(req, res, next) {
  // Moved Permanently
  if (req.originalUrl === '/learn' || req.originalUrl === '/learn/index.html') {
    res.writeHead(301, { 'Location': 'http://localhost:3000/learn/' });
    res.end();
    return;
  }

  var urlObj = url.parse(req.url);
  switch (urlObj.pathname) {
    case '/':
      return index(req, res, next, urlObj);
    case '/submit':
      return submit(req, res, next, urlObj);
    case '/file':
      return file(req, res, next, urlObj);
    default:
      return defaultMiddle(req, res, next)
  }
  next();
}

module.exports = {
  router: '/learn',
  middleware: middleware
};
