# 快速上手

PJtools Map Vue 致力于提供给Web前端程序员**简便**的WebGIS开发体验。

> 在开始之前，推荐先学习 [Vue](https://cn.vuejs.org/) 、[ES2015](http://babeljs.io/docs/learn-es2015/) 和 [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/api/)，并正确安装和配置了 [Node.js](https://nodejs.org/) v8.9 或以上。官方指南假设你已了解关于 HTML、CSS 和 JavaScript 的中级知识，并且已经完全掌握了 Vue 的正确开发方式。如果你刚开始学习前端或者 Vue，将 Map 框架作为你的第一步可能不是最好的主意。

## 引入 pjtools-map-vue

### 1. 安装脚手架工具

[vue-cli](https://github.com/vuejs/vue-cli)

```bash
$ npm install -g @vue/cli
# OR
$ yarn global add @vue/cli
```

### 2. 创建一个项目

使用命令行进行初始化。

```bash
$ vue create map-demo
```

并配置项目。

若安装缓慢报错，可尝试用 `cnpm` 或别的镜像源自行安装：`rm -rf node_modules && cnpm install`。

### 3. 前置依赖组件

```bash
$ npm i --save ant-design-vue
$ npm i --save moment
$ npm i --save lodash
$ npm i --save vue
$ npm i --save vue-template-compiler
```

- `ant-design-vue`：请安装 `>=1.5.0` 版本，由于 Map 组件的部分UI是基于 `ant-design-vue` 库实现的。
- `moment`：请安装 `>=2.21.0` 版本，`moment` 时间库是`ant-design-vue` 库的前置依赖，因此也需安装。
- `lodash`：请安装 `>=4.17.5` 版本，基础函数工具库。

### 4. 前置地图插件

以前开发地图时，将`GeoGlobe` 、`mapbox-gl`等插件库需手动引入项目中，而地图 Map 组件则无需手动引入插件库。

地图 Map 组件采用异步加载插件库的技术，不会默认全局引入，当使用地图 Map 组件时，会自动初始动态加载注入，不使用则不引入。

请将 `GeoMap` 资源文件夹拷贝到脚手架项目的 `static` 静态文件夹下，具体文件夹目录，可参考 [Map组件](/components/map-cn/) 详细说明。基于 `武大吉奥信息技术有限公司` 的产品私有性，具体前置依赖  `GeoMap` 资源文件夹请在项目组内部索要，不提供公共互联网下载。

### 5. 使用 Map 组件库

```bash
$ npm i --save pjtools-map-vue
```

**完整引入**

```jsx
import Vue from 'vue';
import Antd from 'ant-design-vue';
import PJtoolsMap from 'pjtools-map-vue';
import App from './App';
import 'ant-design-vue/dist/antd.css';
import 'pjtools-map-vue/dist/pjmap.css';

Vue.config.productionTip = false;

Vue.use(Antd);
Vue.use(PJtoolsMap);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
});
```

以上代码便完成了 PJtools-Map-Vue 的引入。需要注意的是，样式文件需要单独引入。

**局部导入组件**

```jsx
import Vue from 'vue';
import { Map } from 'pjtools-map-vue';
import App from './App';

Vue.config.productionTip = false;

/* v1.1.2 */
Vue.component(Map.name, Map);

/* v1.1.3+ 自动注册Button下组件 */
Vue.use(Map);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
});
```

## 兼容性

PJtools Map Vue 支持所有的现代浏览器和 IE11+，基于IE浏览器的性能与标准支持情况不佳，不推荐使用IE浏览器环境进行开发、部署运行。

对于 IE 系列浏览器，需要提供 [es5-shim](https://github.com/es-shims/es5-shim) 和 [es6-shim](https://github.com/paulmillr/es6-shim) 等 Polyfills 的支持。

如果你使用了 babel，强烈推荐使用 [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) 和 [babel-plugin-transform-runtime](https://babeljs.io/docs/plugins/transform-runtime/) 来替代以上两个 shim。

> 避免同时使用 babel 和 shim 两种兼容方法，以规避中所遇问题

## 按需加载

如果你在开发环境的控制台看到下面的提示，那么你可能使用了 `import { Map } from 'pjtools-map-vue';` 的写法引入了 Map 组件模块，这会影响应用的网络性能。

```
You are using a whole package of antd, please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.
```

> ![](https://zos.alipayobjects.com/rmsportal/GHIRszVcmjccgZRakJDQ.png)

可以通过以下的写法来按需加载组件。

```jsx
import Map from 'pjtools-map-vue/lib/map';
import 'pjtools-map-vue/lib/map/style'; // 或者 pjtools-map-vue/lib/map/style/css 加载 css 文件
```

如果你使用了 babel，那么可以使用 [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) 来进行按需加载，加入这个插件后。你可以仍然这么写：

```jsx
import { Map } from 'pjtools-map-vue';
```

插件会帮你转换成 `pjtools-map-vue/lib/xxx` 的写法。另外此插件配合 [style](https://github.com/ant-design/babel-plugin-import#usage) 属性可以做到模块样式的按需自动加载。

> 注意，babel-plugin-import 的 `style` 属性除了引入对应组件的样式，也会引入一些必要的全局样式。如果你不需要它们，建议不要使用此属性。你可以 `import 'pjtools-map-vue/dist/pjmap.css` 手动引入，并覆盖全局样式。
