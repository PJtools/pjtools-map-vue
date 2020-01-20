const pjtools = require('../components');
const req = require.context('../components', true, /^\.\/locales\/(?!__tests__).+_.+\.js$/);

pjtools.locales = {};

req.keys().forEach(mod => {
  const match = mod.match(/\/([^/]+).js$/);
  pjtools.locales[match[1]] = req(mod).default;
});

module.exports = pjtools;
