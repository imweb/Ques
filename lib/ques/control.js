var map = require('map-stream')
  , dox = require('dox')
  , path = require('path')
  , fs = require('fs')
  , config = require('../utils/config')()
  , cwd = process.cwd();

function is(obj, type) {
  var tags = obj.tags;
  for (var i = 0, l = tags.length; i < l; i++) {
    if (tags[i].type === type) {
      return true;
    }
  }
  return false;
}

/**
 * control
 * @returns {Stream}
 */
function control() {
  return map(function (file, fn) {
    var string = file.contents.toString()
      , name = file.query.match(/\?([\w\-]+)/)[1]
      , js = path.join(cwd, config.src, './components', name, './main.js')
      , comments = 'null'
      , content = '';

    if (fs.existsSync(js)) {
      comments = dox.parseComments(fs.readFileSync(js, 'utf-8'));

      comments.forEach(function (comment) {
        if (is(comment, 'content')) {
          content = comment.description.full
            .replace(/^\<p\>/, '')
            .replace(/\<\/p\>$/, '');
        }
      });

      comments = JSON.stringify(comments)
                  .replace(/\&/g, '&amp;')
                  .replace(/\</g, '&lt;')
                  .replace(/\>/g, '&gt;');
    }

    string = string
        .replace(/\{\{\placeholder}\}/, '<' + name + '>' + content + '</' + name + '>')
        // .replace(/\{\{comments\}\}/, comments)
        // TODO have some bug????
        .replace(/\{\{comments\}\}/, function () {
          return comments;
        });

    // prefix the data
    file.contents = new Buffer(string);
    fn(null, file);
  });
}

module.exports = control;

