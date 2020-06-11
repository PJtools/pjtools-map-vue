import 'babel-polyfill';
import './index.less';
import '../components/style.js';
import 'highlight.js/styles/solarized-light.css';
import Vue from 'vue';
import Vuex from 'vuex';
import VueI18n from 'vue-i18n';
import VueRouter from 'vue-router';
import VueClipboard from 'vue-clipboard2';
import Md from './components/md';
import Api from './components/api';
import './components';
import demoBox from './components/demoBox';
import demoContainer from './components/demoContainer';
import zhCN from './theme/zh-CN';
import enUS from './theme/en-US';

import Test from '../docs/vue/changelog.zh-CN';

Vue.use(Vuex);
Vue.use(VueClipboard);
Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.component(Md.name, Md);
Vue.component(Api.name, Api);
Vue.component('demo-box', demoBox);
Vue.component('demo-container', demoContainer);

const i18n = new VueI18n({
  locale: zhCN.locale,
  messages: {
    [zhCN.locale]: { message: zhCN.messages },
    [enUS.locale]: { message: enUS.messages },
  },
});

const router = new VueRouter({
  mode: 'history',
  routes: [{ path: '/*', component: Test }],
});

const store = new Vuex.Store({
  state: {
    username: 'pjtools',
  },
  mutations: {
    update(state, payload) {
      state.username = payload.username;
    },
  },
});

new Vue({
  el: '#app',
  i18n,
  router,
  store,
});
