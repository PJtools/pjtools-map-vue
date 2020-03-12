/**
 * @文件说明: 地图组件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-10 19:02:38
 */

import { PreLoading } from './components';
import { initDefaultProps } from '../_util/antdv';
import { getPrefixCls, isNumeric } from '../_util/methods-util';
import mapTypes from './mapTypes';

export default {
  name: 'PjMap',
  components: {
    PreLoading,
  },
  inheritAttrs: false,
  props: initDefaultProps(mapTypes(), {
    width: '100%',
    height: '100%',
  }),
  data() {
    return {
      // 地图的Pre-Loading预加载状态
      preloading: true,
      // 地图的Pre-Loading预加载的描述
      description: '',
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
  methods: {
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
  },
  render() {
    const { classes, styles } = this;
    const mapProps = {
      class: classes,
      style: styles,
    };

    return <section {...mapProps}>{this.renderPreLoading()}</section>;
  },
};
