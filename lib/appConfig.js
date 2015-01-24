var program = require('commander')
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
  return config;
};
