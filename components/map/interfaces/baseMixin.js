/**
 * @文件说明: 定义地图UI交互组件的基础Mixin
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-18 15:46:39
 */

import { isArray } from '../../_util/methods-util';

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
      const cls = [`${prefixCls}-interfaces-wrapper`];
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
};
