/**
 * @文件说明: Map Component - 地图组件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-10 19:01:55
 */

import Vue from 'vue';
import Base from '../base';
import hat from 'hat';
import { PreLoading, Message } from './components';
import { initDefaultProps } from '../_util/antdv';
import { getPrefixCls, isNumeric } from '../_util/methods-util';
import mapTypes from './mapTypes';

const Map = {
  name: 'PjMap',
  components: {
    PreLoading,
  },
  inheritAttrs: false,
  props: initDefaultProps(mapTypes(), {
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
      // this.$preload
      //   .load({
      //     baseUrl,
      //   })
      //   .then(exports => {
      //     console.log(exports);
      //   })
      //   .catch(() => {
      //     this.message.error('地图前置依赖资源库加载失败，资源库地址可能错误或不存在.');
      //   });
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
        <div>map container.</div>
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
