var program = require('commander')
  , fs = require('fs')
  , version = require('../package').version;

program
  .version(version)
  .option('-p, --port [port]', 'Listen port')
  .option('-s, --src [src]', 'Source path')
  .option('-a, --addon [addon]', 'Add on')
  .parse(process.argv);

module.exports = function (config) {
  program.addon &&
    (program.addon = program.addon.split(/ *, */));

  ['port', 'src', 'addon']
    .forEach(function (key) {
      if (program[key]) config[key] = program[key];
    });

  if (config.files === '*') {
    config.files = fs.readdirSync(config.src).filter(function (em) {
        return !!(~em.indexOf('.html'));
    });
  }

  return config;
};
