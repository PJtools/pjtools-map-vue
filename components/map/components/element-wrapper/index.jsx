/**
 * @文件说明: 地图内置组件 - 动态实例Vue组件包封装器
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-11 16:31:47
 */

import Vue from 'vue';
import Base from '../../../base';
import { BaseMixin, PropTypes, getComponentFromProp, filterEmpty } from '../../../_util/antdv';
import { isFunction, isString } from '../../../_util/methods-util';
import DefaultMarker from './marker';
import DefaultPopup from './popup';

const ElementWrapper = {
  inheritAttrs: false,
  mixins: [BaseMixin],
  inject: {
    mapProvider: { default: () => {} },
  },
  props: {
    // 组件包的类型，内置默认：[ Marker | Popup ]
    type: PropTypes.string,
    // Slot插槽
    slots: PropTypes.any,
    // 组件的传递属性数据
    vProps: PropTypes.object,
    // 原生对象的参数选项
    options: PropTypes.object.def({}),
  },
  computed: {
    iMapApi() {
      const {
        mapProvider: { iMapApi },
      } = this;
      return iMapApi;
    },
  },
  methods: {
    // 根据插槽名称获取组件模板
    renderSlotScopeNodes(name) {
      const { type, iMapApi, vProps } = this;
      let slotName = null;
      switch (type) {
        case 'marker':
        case 'popup':
          slotName = `${type}.${name}`;
          break;
        default:
          slotName = name;
          break;
      }
      const slotNodes = getComponentFromProp(iMapApi.component, slotName, {}, false);
      return slotNodes ? filterEmpty(slotNodes({ iMapApi, ...vProps })) : null;
    },

    // 根据插槽的类型获取不同的插槽内容节点
    getNodesBySolts(slots) {
      if (isFunction(slots)) {
        return <div>{slots(h)}</div>;
      } else if (typeof slots === 'object' && slots instanceof HTMLElement) {
        return <div domPropsInnerHTML={slots.outerHTML} />;
      } else if (isString(slots)) {
        // 判断是否为插槽名称，则根据模板进行注入
        return this.renderSlotScopeNodes(slots) || null;
      }
    },
  },
  render(h) {
    const { slots, type, vProps, options } = this;
    // 判断是否无插槽对象，则直接采用默认组件
    switch (type) {
      case 'marker': {
        return !slots ? (
          <div>
            <DefaultMarker {...{ props: vProps, options }} />
          </div>
        ) : (
          this.getNodesBySolts(slots)
        );
      }
      case 'popup': {
        return <DefaultPopup {...{ props: { ...vProps, options } }}>{!slots ? null : this.getNodesBySolts(slots)}</DefaultPopup>;
      }
      default:
        return null;
    }
  },
};

ElementWrapper.newInstance = function newElementWrapperInstance(properties, callback) {
  const { getContainer, style, class: className, iMapApi, ...props } = properties || {};
  // 获取待创建的DOM对象
  const div = document.createElement('div');
  const element = getContainer ? getContainer() : document.body;
  element.appendChild(div);
  // 构建Vue组件实例
  const V = Base.Vue || Vue;
  new V({
    el: div,
    provide() {
      return {
        mapProvider: iMapApi.component.proxyVm._data,
      };
    },
    mounted() {
      const vm = this;
      this.$nextTick(() => {
        callback({
          component: vm,
          destroy() {
            vm.$destroy();
            vm.$el.parentNode.removeChild(vm.$el);
          },
        });
      });
    },
    render() {
      const p = {
        ref: 'elementWrapper',
        style,
        class: className,
        props,
      };
      return <ElementWrapper {...p} />;
    },
  });
};

export default ElementWrapper;
