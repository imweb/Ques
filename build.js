var grab = require('./lib/grab');

grab('todomvc.html')
    .output('./dist')
    .done(function () {
      console.log('done');
    });
