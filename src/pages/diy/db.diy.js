var DB = require('db');

DB.extend({
    ke: DB.httpMethod({
        url: 'http://ke.qq.com/cgi-bin/index_json',
        type: 'JSONP',
        preload: true
    })
})

module.exports = DB;
