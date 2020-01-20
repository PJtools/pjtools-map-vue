/* eslint no-console:0 */
function camelCase(name) {
  return (
    name.charAt(0).toUpperCase() +
    name.slice(1).replace(/-(\w)/g, (m, n) => {
      return n.toUpperCase();
    })
  );
}

const req = require.context('./components', true, /^\.\/[^_][\w-]+\/style\/index\.js?$/);

req.keys().forEach(mod => {
  let v = req(mod);
  if (v && v.default) {
    v = v.default;
  }
  const match = mod.match(/^\.\/([^_][\w-]+)\/index\.js?$/);
  if (match && match[1]) {
    exports[camelCase(match[1])] = v;
  }
});

module.exports = require('./components');
