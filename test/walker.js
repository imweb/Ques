var walker = require('../lib/utils/walker')
  , cheerio = require('cheerio')
  , Check = require('./utils/check');

describe('walker', function () {
  describe('walker.tags()', function () {
    it('should able to walk the cheerio instance', function (done) {
      var $ = cheerio.load('<html><head></head><body><a href="http://ke.qq.com"></a></body></html>')
        , check = new Check(['body', 'a'], function () {
          done();
        });

      walker.tags($('body'), function (ele) {
        ele.type.should.equal('tag');
        check.reach(ele.name);
      });
    });

    it('should able to walk the AST', function (done) {
      var $ = cheerio.load('<html><head></head><body><a href="http://ke.qq.com"></a></body></html>')
        , check = new Check(['html', 'head', 'body', 'a'], function () {
          done();
        });


      walker.tags($._root.children, function (ele) {
        ele.type.should.equal('tag');
        check.reach(ele.name);
      });
    });
  });
});
