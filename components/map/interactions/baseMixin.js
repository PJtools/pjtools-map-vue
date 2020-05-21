/**
 * @文件说明: 定义地图交互组件的基础Mixin
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-18 15:46:39
 */

import { isArray } from '../../_util/methods-util';
import { getComponentFromProp, filterEmpty } from '../../_util/antdv';

export default {
  inject: {
    mapProvider: { default: () => {} },
  },
  computed: {
    classes() {
      const {
        mapProvider: { prefixCls },
        className,
      } = this;
      const cls = [`${prefixCls}-interactions-wrapper`];
      if (className) {
        if (isArray(className)) {
          cls.push(...className);
        } else {
          cls.push(className);
        }
      }
      return cls;
    },
    iMapApi() {
      const {
        mapProvider: { iMapApi },
      } = this;
      return iMapApi;
    },
  },
  methods: {
    // 根据定义的Prop属性值获取Slot插槽对象
    getSlotFromProp(name) {
      let prefix = this.$options.name.replace('PjMap.', '');
      prefix = `${prefix.toLowerCase()}.${name}`;
      // 查找具名插槽对象
      return getComponentFromProp(this.iMapApi.component, prefix, {}, false) || null;
    },

    // 渲染指定具名Slot插槽
    renderSlotScopeNodes(name, options = {}) {
      const slotNodes = this.getSlotFromProp(name);
      return slotNodes ? filterEmpty(slotNodes(options)) : null;
    },
  },
};
