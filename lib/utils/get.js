var valid = require('url-valid');

/**
 * get
 * @param {String} url
 */
module.exports = function (url) {
  var buffers = [];
  return valid(url)
    .on('check', function (err, exist) {
      if (err || !exist) throw new Error(url + ' is not exist');
    }).on('data', function (err, buffer) {
      buffers.push(buffer);
    }).on('end', function () {
      this.emit('body', Buffer.concat(buffers).toString());
    });
};
