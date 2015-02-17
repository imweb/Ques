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

function Tag(tags) {
  this.hasTag = {};
  this.tags = tags || [];
  var self = this;
  this.tags.forEach(function (tag) {
    self.hasTag[tag] = true;
  });
}
Tag.prototype.push = function (tagName) {
  if (!this.hasTag[tagName]) {
    this.tags.push(tagName);
    this.hasTag[tagName] = true;
    return true;
  }
  return false;
};
Tag.prototype.has = function (tagName) {
  return this.hasTag[tagName];
};

Tag.prototype.custom = function () {
  var res = [];
  this.tags.forEach(function (tagName) {
    if (!W3CTAG[tagName]) res.push(tagName);
  });
  return res;
}

module.exports = Tag;
