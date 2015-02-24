var TagSet = require('../lib/lib/tagSet')
  , Set = require('set-component');

describe('TagSet()', function(){
  it('should return a Set instance', function () {
    ((new TagSet()) instanceof Set).should.be.true;
    (TagSet.super_ === Set).should.be.true;
  });

  it('should filter the custom elements', function () {
    new TagSet(['a', 'custom', 'div'])
      .custom().should.eql(['custom']);
  });
});
