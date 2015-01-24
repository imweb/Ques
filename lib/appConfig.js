var program = require('commander')
  , version = require('../package').version;

program
  .version(version)
  .option('-p, --port [port]', 'Listen port')
  .parse(process.argv);

module.exports = function (config) {
  ['port', 'src']
    .forEach(function (key) {
      if (program[key]) config[key] = program[key];
    });
  return config;
};
