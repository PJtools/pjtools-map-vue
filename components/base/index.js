import { antDirective } from '../_util/antdv';

const base = {};
const install = function(Vue) {
  base.Vue = Vue;
  Vue.use(antDirective);
};
base.install = install;

export default base;
