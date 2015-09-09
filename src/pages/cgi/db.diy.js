var DB = require('db');

DB.extend({
    test: DB.httpMethod({
        url: '/cgi-bin/no_exist',
        // mark the data to component
        cgi: 'recommnd => #recommnd'
    })
});

module.exports = DB;
