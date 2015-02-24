var filters = require('../../src/lib/cjs/filters')
  , _filters = {}
  , _turnback = function (s) { return s; }
  , path = require('path')
  , src = path.resolve(require('./config')().src);

// build the read filters
Object.keys(filters).forEach(function (key) {
  _filters[key] = filters[key].read || filters[key] || _turnback;
});

/**
 * _makeDeps
 * @param {Array} deps
 * @returns {String}
 * @example _makeDeps(['a', 'b']) -> "['a', 'b']"
 */
function _makeDeps(deps) {
  var i = 0 , l = deps.length;
  for (; i < l; i++) {
    deps[i] = "'" + deps[i] + "'";
  }
  return "[" + deps.join(', ') + "]"
}

/**
 * _getDepJS
 * @param {String} customTag the custom tag name
 * @returns {String} the custom tag main script path
 * @example _getDepJS('test') -> './components/test/main.js'
 */
function _getDepJS(customTag) {
  return _getDep(customTag, 'main.js');
}

/**
 * _getDepCSS
 * @param {String} customTag the custom tag name
 * @returns {String} the custom tag main script path
 * @example _getDepCSS('test') -> './components/test/main.css'
 */
function _getDepCSS(customTag) {
  return _getDep(customTag, 'main.css');
}

/**
 * _getDep
 * @param {String} customTag the custom tag name
 * @param {String} file the file name
 * @returns {String} the custom tag file path
 */
function _getDep(customTag, file) {
  return './components/' + customTag + '/' + file;
}

/**
 * _fix
 * @param {String} string the context need to fix
 * @param {String} path the custom tag name or path
 * @returns {String}
 */
function _fix(string, path) {
  var mod =  path.match(/components[\/\\](\w+?)[\/\\$]/);
  mod = (mod && mod[1]) || (path);
  return string.replace(/\$\_\_/g, mod + '__').trim();
}

/**
 * _makeFragment
 * @param {Cheerio} $
 * @param {Element} $ele
 * @param {Function} tpl
 * @param {String} uid
 * @returns {Element}
 */
function _makeFragment($, $ele, tpl, uid) {
  var attrs = $ele.attr()
    , res = $(tpl(attrs, { filters: _filters })).addClass('component-' + uid);
  if (attrs.id) res.attr('id', attrs.id);
  if (attrs.class) res.addClass(attrs.class);
  return res;
}

/**
 * _getComPath
 * get component path
 * @param {String} name component name
 * @param {String} [file]
 * @returns {String}
 */
function _getComPath(name, file) {
  console.log(name, file);
  return file ?
    path.join(src, 'components', name, file) :
    path.join(src, 'components', name);
}

/**
 * _getComName
 * get component name
 * @param {String} string
 *  can be:
 *    1. {{conpentName}}/main.js
 *    2. {{conpentName}}/main.css
 *    3. {{conpentName}}/main.html
 * @returns {String}
 */
function _getComName(string) {
  var match = string.match(/(\w+)(\W+)main\.(js|css|html)$/);
  if (match) return match[1];
  return false;
}

module.exports = {
  makeDeps: _makeDeps,
  getDepJS: _getDepJS,
  getDepCSS: _getDepCSS,
  getDep: _getDep,
  fix: _fix,
  makeFragment: _makeFragment,
  getComPath: _getComPath,
  getComName: _getComName
};
