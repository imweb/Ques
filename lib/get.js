var valid = require('url-valid');

module.exports = function (url) {
  var buffers = [];
  return valid(url)
    .on('data', function (err, buffer) {
      buffers.push(buffer);
    }).on('end', function () {
      this.emit('body', Buffer.concat(buffers).toString());
    });
}
