/**
 * @文件说明: 地图内置组件 - 动态实例UI组件包封装器
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-29 14:32:00
 */

import { PropTypes, Portal, getComponentFromProp, filterEmpty } from '../../../_util/antdv';

const windowIsUndefined = !(typeof window !== 'undefined' && window.document && window.document.createElement);

const ComponentWrapper = {
  name: 'PjmapComponent',
  builtIn: true,
  inheritAttrs: false,
  props: {
    visible: PropTypes.bool.def(false),
    wrapClassName: PropTypes.any,
    position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom', 'left', 'right', 'none']).def('top-left'),
    offset: PropTypes.array.def([0, 0]),
  },
  model: {
    prop: 'visible',
    event: 'change',
  },
  data() {
    return {
      wrapVisible: false,
    };
  },
  inject: {
    mapProvider: { default: () => {} },
  },
  computed: {
    iMapApi() {
      const {
        mapProvider: { iMapApi },
      } = this;
      return iMapApi;
    },
    prefixCls() {
      const {
        mapProvider: { prefixCls },
      } = this;
      return prefixCls;
    },
    wrapperComponentClass() {
      const { wrapClassName } = this;
      const classNames = ['component-root-container'];
      wrapClassName && classNames.push(wrapClassName);
      return classNames;
    },
    wrapperComponentOffset() {
      const { offset, position } = this;
      let x = offset && offset[0] ? Number(offset[0]) : 0;
      let y = offset && offset[1] ? Number(offset[1]) : 0;
      // 判断是否设定为居右，则偏移量取反值
      if (position.indexOf('right') !== -1) {
        x = 0 - x;
      }
      // 判断是否设定为居底，则偏移量取反值
      if (position.indexOf('bottom') !== -1) {
        y = 0 - y;
      }

      return {
        transform: `translate(${x}px, ${y}px)`,
      };
    },
  },
  watch: {
    ['iMapApi.component'](val, old) {
      if (!old && val) {
        this.wrapVisible = !!this.visible;
      }
    },
    visible(val) {
      this.wrapVisible = val;
      !val && this.removeCurrentContainer();
    },
  },
  methods: {
    // 获取地图扩展UI组件的容器对象
    getComponentsContainer() {
      const { iMapApi } = this;
      if (iMapApi) {
        const container = iMapApi.getMapViewContainer();
        let element = container && container.parentNode;
        if (element) {
          const { prefixCls } = this.mapProvider;
          return element.querySelector(`.${prefixCls}-extended-components > section[data-type='component']`);
        }
      }
      return null;
    },

    // 获取组件待渲染的DOM容器对象
    getDomContainer() {
      if (windowIsUndefined) {
        return null;
      }
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = this.setWrapperClassName();
        // 动态追加对象
        const parentNode = this.getComponentsContainer();
        if (parentNode) {
          parentNode.appendChild(this.container);
        }
      }
      return this.container;
    },

    // 设置当前组件包的Class类名
    setWrapperClassName() {
      const { prefixCls, position } = this;
      // 获取组件的初始位置
      const positionName = position.indexOf('-') !== -1 || position === 'none' ? position : `${position}-center`;
      const wrapperClassNames = [`${prefixCls}-components-wrapper`, `position-${positionName}`];
      return wrapperClassNames.join(' ');
    },

    // 获取组件包的插槽节点对象
    getWrapperChildrenNodes() {
      const { wrapperComponentClass, wrapperComponentOffset } = this;
      // 获取Slot插槽对象
      const slotNodes = getComponentFromProp(this, 'default', {}, false);

      return (
        <div class={wrapperComponentClass} style={wrapperComponentOffset}>
          {slotNodes ? filterEmpty(slotNodes()) : null}
        </div>
      );
    },

    // 存储当前组件包对象
    savePortal(component) {
      this.component = component;
    },

    // 移除当前组件的容器对象
    removeCurrentContainer() {
      this.container = null;
      this.component = null;
    },
  },
  updated() {
    if (this.container) {
      this.container.className = this.setWrapperClassName();
    }
  },
  beforeDestroy() {
    this.removeCurrentContainer();
  },
  render() {
    let portal = null;
    if (this.wrapVisible) {
      portal = (
        <Portal
          getContainer={this.getDomContainer}
          children={this.getWrapperChildrenNodes()}
          {...{
            directives: [
              {
                name: 'ant-ref',
                value: this.savePortal,
              },
            ],
          }}
        ></Portal>
      );
    }
    return portal;
  },
};

export default ComponentWrapper;
