function Check(checks, cb) {
  this.checks = checks;
  this.cb = cb;
}
Check.prototype.reach = function (name) {
  if (this.checks.shift() !== name)
    throw new Error('Should not reach ' + name);

  if (!this.checks.length)
    this.cb();
};

module.exports = Check;
