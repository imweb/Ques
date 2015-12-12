var map = require('map-stream')
  , postcss = require('postcss')
  , cssnext = require('cssnext')
  , cssgrace = require('cssgrace')
  , _ = require('../utils/components')
  // get the DEFAULT config
  , config = require('../utils/config')();

function css() {
  var contenter = postcss()
    .use(cssnext(config.cssnext))
    // waiting cssgrace fixed issue#26
    // .use(cssgrace.postcss);

  return map(function (file, fn) {
    var css = file.contents.toString();

    try {
      css = contenter.process(css, { from: file.path }).css;
    } catch(e) {
      console.error(e);
      css = [
        'html::before {',
          'display: block;',
          'white-space: pre-wrap;',
          'position: fixed;',
          'top: 0;',
          'left: 0;',
          'right: 0;',
          'z-index: 10000;',
          'font-size: .9em;',
          'padding: 1.5em 1em 1.5em 4.5em;',
          'color: #318edf;',
          'background-color: #fff;',
          'background: url(',
            '"data:image/svg+xml;charset=utf-8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%0A%20%20width%3D%22512px%22%20height%3D%22512px%22%20viewBox%3D%220%200%20512%20512%22%20enable-background%3D%22new%200%200%20512%20512%22%20xml%3Aspace%3D%22preserve%22%3E%0A%20%20%0A%3ClinearGradient%20id%3D%22SVGID_1_%22%20gradientUnits%3D%22userSpaceOnUse%22%20x1%3D%22125.7515%22%20y1%3D%22307.4834%22%20x2%3D%22125.7514%22%20y2%3D%22-73.4854%22%20gradientTransform%3D%22matrix(1%200%200%20-1%20-50%20373)%22%3E%0A%20%20%3Cstop%20%20offset%3D%220%22%20style%3D%22stop-color%3A%23428BCA%22%2F%3E%0A%20%20%3Cstop%20%20offset%3D%220.325%22%20style%3D%22stop-color%3A%23507DBF%22%2F%3E%0A%20%20%3Cstop%20%20offset%3D%221%22%20style%3D%22stop-color%3A%235C71B6%22%2F%3E%0A%3C%2FlinearGradient%3E%0A%20%20%3Cpath%0A%20%20%20%20fill%3D%22url(%23SVGID_1_)%22%0A%20%20%20%20d%3D%22M256.002%2C50C142.23%2C50%2C50%2C142.229%2C50%2C256.001C50%2C369.771%2C142.23%2C462%2C256.002%2C462C369.771%2C462%2C462%2C369.771%2C462%2C256.001C462%2C142.229%2C369.771%2C50%2C256.002%2C50z%20M256.46%2C398.518c-16.207%2C0-29.345-13.139-29.345-29.346c0-16.205%2C13.138-29.342%2C29.345-29.342c16.205%2C0%2C29.342%2C13.137%2C29.342%2C29.342C285.802%2C385.379%2C272.665%2C398.518%2C256.46%2C398.518zM295.233%2C158.239c-2.481%2C19.78-20.7%2C116.08-26.723%2C147.724c-1.113%2C5.852-6.229%2C10.1-12.187%2C10.1h-0.239c-6.169%2C0-11.438-4.379-12.588-10.438c-6.1-32.121-24.293-128.504-26.735-147.971c-2.94-23.441%2C15.354-44.171%2C38.977-44.171C279.674%2C113.483%2C298.213%2C134.488%2C295.233%2C158.239z%22%0A%20%20%2F%3E%0A%3C%2Fsvg%3E"',
          ') 1em 1em / 2.5em 2.5em no-repeat, #fff;',
          'border-bottom: 4px solid #318edf;',
          'box-shadow: 0 0 .6em rgba(0,0,0, .25);',
          'font-family: Menlo, Monaco, monospace;',
          'content: "\203' + e.message + '";',
        '}'
      ].join('\n');
    }


    file.contents = new Buffer(
      _.fix(
        css,
        file.path
      )
    );
    fn(null, file);
  });
}

module.exports = css;
