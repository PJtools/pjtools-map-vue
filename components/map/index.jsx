/**
 * @文件说明: Map Component - 地图组件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-10 19:01:55
 */

import 'whatwg-fetch';
import Vue from 'vue';
import Base from '../base';
import hat from 'hat';
import isPlainObject from 'lodash/isPlainObject';
import { PreLoading, Message } from './components';
import Controls from './controls';
import Interactions from './interactions';
import { initDefaultProps } from '../_util/antdv';
import {
  getPrefixCls,
  isString,
  isNumeric,
  isFunction,
  isArray,
  isNotEmptyArray,
  isBoolean,
  isBooleanTrue,
  isBooleanFlase,
  isInteger,
  isEmpty,
  has,
  isHttpUrl,
  isCoordinate,
  hasClass,
  addClass,
  removeClass,
  getUrlToLink,
  fetchJsFile,
} from '../_util/methods-util';
import { topTileExtentToGauss, topTileExtentToWMTS, topTileExtentToResolution } from '../_pmap/util/topTileExtent';
import transform from '../_pmap/util/transform';
import DOM from '../_pmap/util/dom';
import Query from '../_pmap/query';
import PJtoolsMap from '../_pmap';
import mapProps from './mapProps';

const Map = {
  name: 'PjMap',
  components: {
    PreLoading,
    Controls,
    Interactions,
  },
  inheritAttrs: false,
  props: initDefaultProps(mapProps(), {
    width: '100%',
    height: '100%',
    baseUrl: '/static/GeoMap/',
  }),
  data() {
    const message = this.setMapMessageInstance();

    return {
      // 地图的Pre-Loading预加载状态
      preloading: true,
      // 地图的Pre-Loading预加载的描述
      description: '',
      // 地图的Message消息实例对象
      message,
      // 地图Map的实例化对象
      iMapApi: null,
      // 地图控件数据集合
      mapControls: null,
      // 地图UI组件对象集合
      mapInteractions: [],
      // 地图移除销毁状态
      mapRemoved: false,
    };
  },
  provide() {
    const _vm = this;
    // 定义Class类名前缀
    const { prefixCls: customizePrefixCls } = _vm;
    const prefixCls = getPrefixCls('map', customizePrefixCls);
    // 定义传递属性的代理对象
    this.proxyVm = new Vue({
      data() {
        return {
          prefixCls,
          message: _vm.message,
          iMapApi: _vm.iMapApi,
          $slots: _vm.$slots,
          $scopedSlots: _vm.$scopedSlots,
        };
      },
    });
    return {
      mapProvider: this.proxyVm._data,
    };
  },
  computed: {
    classes() {
      const {
        bordered,
        proxyVm: { prefixCls },
      } = this;
      return {
        [`${prefixCls}`]: true,
        [`${prefixCls}-bordered`]: bordered,
      };
    },
    styles() {
      const { width, height } = this;
      const containerWidth = isNumeric(width) ? `${width}px` : String(width);
      const containerHeight = isNumeric(height) ? `${height}px` : String(height);
      return {
        width: containerWidth,
        height: containerHeight,
      };
    },
  },
  mounted() {
    this.proxyVm._data.$scopedSlots = this.$scopedSlots;
    this.preloadMapPluginsDll();
  },
  beforeDestroy() {
    this.destroyPJtoolsMap();
  },
  methods: {
    // 实例化当前地图组件的Message消息
    setMapMessageInstance() {
      return new Message(hat(), {
        getContainer: () => this.$refs.PJtoolsMapSection || document.body,
      });
    },

    // 渲染地图的预加载初始化时的Pre-Loading组件
    renderPreLoading() {
      const { preloading, description } = this;

      if (!preloading) {
        return null;
      }

      return (
        <PreLoading description={description} on-destroy={this.handlePreLoadingDestroy}>
          {this.$slots && this.$slots.preloading ? <template slot="preloading">{this.$slots.preloading}</template> : null}
        </PreLoading>
      );
    },

    // 触发Pre-Loading组件注销时回调事件
    handlePreLoadingDestroy() {
      this.$emit('loaded', this.iMapApi);
    },

    // 预加载地图依赖插件基础库
    preloadMapPluginsDll() {
      const { baseUrl } = this;

      this.description = '地图依赖资源加载中';
      this.$preload
        .load({
          baseUrl,
        })
        .then(exports => {
          setTimeout(() => {
            this.initPJtoolsMap(exports);
          }, 0);
        })
        .catch(() => {
          this.message.error('地图前置依赖资源库加载失败，资源库地址可能错误或不存在.');
        });
    },

    // 渲染地图的容器区域
    renderMapContainer() {
      const {
        proxyVm: { prefixCls },
        mapControls,
        mapInteractions,
        mapRemoved,
      } = this;
      const mapCls = `${prefixCls}-container`;

      return !mapRemoved ? (
        <div class={mapCls}>
          {/* 地图视图区域 */}
          <div class={`${mapCls}-views-group`} tabindex="0" hidefocus="true">
            <div ref="PJMapViewWrapper" class={`${mapCls}-view-wrapper`}></div>
          </div>
          {/* 扩展交互组件 */}
          <div class={`${prefixCls}-extended-components`}>
            {/* 地图控件 */}
            {mapControls && mapControls.length ? <Controls ref="mapControls" dataList={mapControls} /> : null}
            {/* 地图交互组件 */}
            <Interactions ref="mapInteractions" data={mapInteractions} />
            {/* 地图扩展组件 */}
            <section data-type="component"></section>
          </div>
        </div>
      ) : null;
    },

    // 加载解析当前地图的配置文件
    loadMapConfig() {
      const { baseUrl, config } = this;

      return new Promise((resolve, reject) => {
        if (config) {
          // 判断config是否为字符串格式类型，则采用异步读取配置文件形式
          if (typeof config === 'string') {
            let url = `${config}`;
            // 判断是否不是有效的Http链接地址，则拼接前缀基础路径
            if (!isHttpUrl(config)) {
              url = getUrlToLink(url, baseUrl);
            }
            // 异步请求Config配置文件
            fetchJsFile(url)
              .then(data => {
                if (data) {
                  resolve(data);
                } else {
                  this.message.error('地图初始化[config]参数配置文件地址路径或内容解析错误.');
                  reject();
                }
              })
              .catch(error => {
                reject(error);
              });
          } else if (isPlainObject(config)) {
            resolve(config);
          }
        } else {
          reject('未设定地图初始化[config]参数配置项，无法保证地图的有效渲染.');
        }
      });
    },

    // 实例化PJtools.Map地图对象
    initPJtoolsMap(exports) {
      if (!this.$refs.PJMapViewWrapper) {
        this.message.error('地图初始化容器对象不存在，请检查设定是否正确.');
        return;
      }

      this.mapRemoved = false;
      this.description = '地图初始化配置';
      this.loadMapConfig().then(config => {
        // 设定Map地图样式的默认字体库
        config.glyphs = `${getUrlToLink('glyphs/', this.baseUrl)}{fontstack}/{range}.pbf`;
        // 实例化地图
        new PJtoolsMap(this.$refs.PJMapViewWrapper, exports, config, {
          onRender: iMapApi => {
            this.iMapApi = iMapApi;
            this.iMapApi.component = this;
            this.proxyVm._data.iMapApi = this.iMapApi;
            // 更新Pre-Loading的提示语
            this.description = '地图正在加载图层源数据';
            // 更新地图控件数据
            this.mapControls =
              this.iMapApi && this.iMapApi.options && this.iMapApi.options.mapControls && this.iMapApi.options.mapControls.length
                ? this.iMapApi.options.mapControls
                : [];
            // 触发设定存在的[render]回调事件
            this.$emit('render', this.iMapApi);
          },
          onLoad: () => {
            // 移除Pre-Loading预加载转场
            this.description = '';
            this.preloading = false;
          },
        });
      });
    },

    // 销毁PJtools.Map地图对象
    destroyPJtoolsMap() {
      // 销毁实例化地图
      this.iMapApi && this.iMapApi.remove();
      // 销毁地图控件
      this.mapControls = null;
      // 销毁地图交互组件
      this.mapInteractions = [];
      // 更新地图销毁状态
      this.mapRemoved = true;
      // 销毁地图实例化对象
      this.iMapApi = null;
    },
  },
  render() {
    const { classes, styles } = this;
    const mapProps = {
      class: classes,
      style: styles,
    };

    return (
      <section ref="PJtoolsMapSection" {...mapProps}>
        {/* Map-Container */}
        {this.renderMapContainer()}
        {/* Pre-Loading */}
        {this.renderPreLoading()}
      </section>
    );
  },
};

Map.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Map.name, Map);
};

// 对外挂接静态方法
Map.$methods = {
  topTileExtentToGauss,
  topTileExtentToWMTS,
  topTileExtentToResolution,
  isString,
  isNumeric,
  isPlainObject,
  isFunction,
  isArray,
  isNotEmptyArray,
  isBoolean,
  isBooleanTrue,
  isBooleanFlase,
  isInteger,
  isEmpty,
  has,
  isHttpUrl,
  isCoordinate,
  hasClass,
  addClass,
  removeClass,
  getUrlToLink,
};
// 对外挂接互联网坐标转换静态方法
Map.$transform = transform;
// 对外挂接常见DOM操作静态方法
Map.$dom = DOM;
// 对外挂接Web GIS Service服务查询静态方法
Map.$query = new Query();

export default Map;
