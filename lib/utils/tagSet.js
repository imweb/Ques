var Set = require('set-component')
  , util = require('util');
var HTML_BLOCK = 'article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section, summary'
  , INLINE = 'a, abbr, acronym, audio, b , basefont, bdo, big, br, canvas, cite, code, command, datalist, dfn, em, embed, font, i, img, input, keygen, kbd, label, mark, meter, output, progress, q, rp, rt, ruby, s, samp, select, small, span, strike, strong, sub, sup, textarea, time, tt, u, var, video, wbr'
  , BLOCK = 'address, article, aside, blockquote, center, dir, div, dd, details, dl, dt, fieldset, figcaption, figure, form, footer, frameset, h1, h2, h3, h4, h5, h6, hr, header, hgroup, isindex, menu, nav, noframes, noscript, ol, p, pre, section, summary, ul'
  , W3CTAG = function () {
    var res = {};
    [HTML_BLOCK, INLINE, BLOCK]
      .join(', ').split(', ').forEach(function (tagName) {
        res[tagName] = true;
      });
    return res;
  }();

function TagSet(tags) {
  Set.call(this, tags);
}
util.inherits(TagSet, Set);
TagSet.prototype.custom = function () {
  return this.values()
    .filter(function (tagName) {
      return !W3CTAG[tagName];
    });
}
TagSet.prototype.add = function (val) {
  if (this.has(val)) return false;
  this.vals.push(val);
  return val;
}

module.exports = TagSet;
