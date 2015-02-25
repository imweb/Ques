var TagSet = require('../lib/utils/tagSet')
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

  it('should add a value & return whether or not', function () {
    var set = new TagSet();
    set.add('test').should.equal('test');
    set.add('test').should.not.be.true;
  });

  it('should return values of a set', function () {
    var set = new TagSet();
    set.add('test');
    set.add('tencent');
    set.values().should.eql(['test', 'tencent']);
  });
});
