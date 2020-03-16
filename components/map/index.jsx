/**
 * @文件说明: Map Component - 地图组件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-10 19:01:55
 */

import Vue from 'vue';
import Base from '../base';
import hat from 'hat';
import isPlainObject from 'lodash/isPlainObject';
import { PreLoading, Message } from './components';
import { initDefaultProps } from '../_util/antdv';
import { getPrefixCls, isNumeric, isHttpUrl, getUrlToLink, fetchJsFile } from '../_util/methods-util';
import PJtoolsMap from '../_pmap';
import mapProps from './mapProps';

const Map = {
  name: 'PjMap',
  components: {
    PreLoading,
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
    };
  },
  provide() {
    const _vm = this;
    this._proxyVm = new Vue({
      data() {
        return {
          message: _vm.message,
        };
      },
    });
    return {
      mapProvider: this._proxyVm._data,
    };
  },
  computed: {
    classes() {
      const { prefixCls: customizePrefixCls, bordered } = this;
      const prefixCls = getPrefixCls('map', customizePrefixCls);
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
    this.preloadMapPluginsDll();
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
        <PreLoading description={description}>
          {this.$slots && this.$slots.preloading ? <template slot="preloading">{this.$slots.preloading}</template> : null}
        </PreLoading>
      );
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
      const { prefixCls: customizePrefixCls } = this;
      const prefixCls = getPrefixCls('map', customizePrefixCls);
      const mapCls = `${prefixCls}-container`;

      return (
        <div class={mapCls}>
          {/* 地图视图区域 */}
          <div class={`${mapCls}-views-group`}>
            <div ref="PJMapViewWrapper" class={`${mapCls}-view-wrapper`}></div>
          </div>
          {/* 扩展交互组件 */}
          <div class={`${prefixCls}-extended-components`}></div>
        </div>
      );
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

      this.description = '地图初始化配置';
      this.loadMapConfig().then(config => {
        // 实例化地图
        const iMapApi = new PJtoolsMap(this.$refs.PJMapViewWrapper, exports, config, {
          onRender: () => {
            setTimeout(() => {
              this.description = '地图正在加载图层源数据';
            }, 0);
          },
          onLoad: () => {
            // 移除Pre-Loading预加载转场
            this.description = '';
            this.preloading = false;
            setTimeout(() => {
              console.log('load');
            }, 0);
          },
        });
        console.log(iMapApi);
      });
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

export default Map;
