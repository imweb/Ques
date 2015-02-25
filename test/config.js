var config = require('../lib/utils/config')
  , DEFAULT = require('../config')
  , path = require('path');

describe('config()', function(){
  it('should return the default options when argument is undefined', function () {
    config().should.equal(DEFAULT);
  });

  it('should return the given file options', function () {
    var options = config(path.resolve('./src/test.html'));
    options.should.containDeep({
      loader: '/lib/require.min.js',
      paths: DEFAULT.paths,
      realPaths: DEFAULT.realPaths
    });
  });
});
