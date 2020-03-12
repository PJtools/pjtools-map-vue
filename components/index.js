/* @remove-on-es-build-begin */
// this file is not used if use https://github.com/ant-design/babel-plugin-import
const ENV = process.env.NODE_ENV;
if (ENV !== 'production' && ENV !== 'test' && typeof console !== 'undefined' && console.warn && typeof window !== 'undefined') {
  console.warn(
    'You are using a whole package of pjtools, ' + 'please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.',
  );
}
/* @remove-on-es-build-end */

import { default as Base } from './base';

import { default as Map } from './map';

import { default as version } from './version';

import { default as preload } from './preload';

const components = [Base, Map];

const install = function(Vue) {
  components.map(component => {
    Vue.use(component);
  });

  Vue.prototype.$preload = preload;
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export { Base, Map, version, install, preload };

export default {
  version,
  install,
};
