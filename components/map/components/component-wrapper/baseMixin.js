/**
 * @文件说明: 定义地图扩展组件的基础Mixin
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-30 12:10:48
 */

import { isFunction } from '../../../_util/methods-util';
import ComponentWrapper from './index';

export default {
  builtIn: true,
  inheritAttrs: false,
  inject: {
    mapProvider: { default: () => {} },
  },
  model: {
    prop: 'visible',
    event: 'visibleChange',
  },
  data() {
    return {
      isRender: !!this.visible,
    };
  },
  computed: {
    iMapApi() {
      const {
        mapProvider: { iMapApi },
      } = this;
      return iMapApi;
    },
    isComponentWrapper() {
      return !!(this.$options && this.$options.isComponentWrapper);
    },
  },
  watch: {
    visible(val) {
      this.isRender = val;
    },
  },
  methods: {
    // 根据嵌套关系渲染组件结构
    renderComponent(onRender) {
      const { isComponentWrapper, isRender, position, offset, wrapClassName, wrapStyle } = this;

      if (isFunction(onRender)) {
        // 判断是否为嵌套组件Wrapper结构，则直接渲染当前组件
        if (isComponentWrapper) {
          return isRender ? onRender() : null;
        } else {
          return (
            <ComponentWrapper visible={isRender} position={position} offset={offset} wrapClassName={wrapClassName} style={wrapStyle}>
              {onRender()}
            </ComponentWrapper>
          );
        }
      }
      return null;
    },

    // 获取当前UI组件的Class类名
    getClassNames(clsName) {
      const {
        className,
        mapProvider: { prefixCls },
      } = this;
      const cls = className ? [className] : [];
      return clsName ? [`${prefixCls}-component-${clsName}`, ...cls] : [...cls];
    },
  },
};
