var path = require('path')
  , fs = require('fs')
  , url = require('url')
  , config = require('../config')
  , cwd = process.cwd();

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

function middleware(req, res, next) {
  var urlObj = url.parse(req.url);
  switch (urlObj.pathname) {
    case '/':
      return index(req, res, next, urlObj);
    case '/submit':
      return submit(req, res, next, urlObj);
  }
  next();
}

module.exports = {
  router: '/learn',
  middleware: middleware
};
