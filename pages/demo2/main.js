var $ = require('jquery'),
    helloworld = require('components/helloworld/render');

function init() {
  $('#container').html(helloworld.render());
}

module.exports = {
  init: init
};
