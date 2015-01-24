var path = require('path')
  , fs = require('fs')
  , url = require('url')
  , config = require('../../config')
  , cwd = process.cwd();

var testFile = path.join(cwd, config.src, 'test.html');

function index(req, res, next) {
  var file = path.resolve(__dirname, 'learn/index.html')
    , test = path.join(cwd)
    , str = fs.readFileSync(file, 'utf-8');

  str = str.replace(
    /\{\{result\}\}/,
    fs.readFileSync(testFile, 'utf-8')
      .replace(/\r?\n/g, '\\n')
      .replace(/'/g, "\\'")
  );

  res.writeHead(200, {
    'Content-Type': 'text/html;charset=utf-8'
  });
  res.end(str);
}

function submit(req, res, next, urlObj) {
  var value = urlObj.query.replace('value=', '')
    , file;
  if (!value) next();
  value = decodeURI(value);
  fs.writeFileSync(testFile, value, 'utf-8');
  res.end();
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
