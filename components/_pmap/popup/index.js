/**
 * @文件说明: 构建地图Popup气泡弹窗接口对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-15 11:38:17
 */

import assign from 'lodash/assign';
import BasicMapApi from '../util/basicMapApiClass';
import { getPrefixCls, isBooleanTrue, isBooleanFlase, addClass, removeClass } from '../../_util/methods-util';
import { ElementWrapper } from '../../map/components';

const defaultPopupOptions = {
  // Popup的内容插槽
  slots: null,
  // Popup容器的Class类名
  className: null,
  // Popup容器的Style样式
  style: null,
  // Popup插槽作用域的自定义数据
  data: null,
  // 是否仅只渲染显示单个Popup
  showSingle: false,
  // 是否渲染默认皮肤
  defaultSkin: true,
  // Popup定位到坐标点的位置
  anchor: 'bottom',
  // Popup的相对偏移量
  offset: [0, 0],
  // Popup的最大宽度
  maxWidth: null,
  // 是否渲染Popup弹窗的Close按钮
  closeButton: true,
  // 是否单击Popup之外则触发关闭
  closeOnClick: true,
};

const _map = Symbol('map');
const _popups = Symbol('popups');

class Popup extends BasicMapApi {
  constructor(iMapApi) {
    super(iMapApi);

    // 地图Map对象
    this[_map] = iMapApi && iMapApi.map;
    // 定义地图的Popup对象存储器
    this[_popups] = {};
  }

  /**
   * 获取所有创建的Popup对象
   */
  get popups() {
    const keys = Object.keys(this[_popups]);
    return keys.map(key => this[_popups][key]);
  }

  /**
   * 动态创建Vue组件版的Popup气泡弹窗对象
   * @param {String} id Popup的唯一Id名
   * @param {Array} coordinates Popup的坐标点
   * @param {Object} options Popup对象的参数选项
   */
  add(id, coordinates, options = {}) {
    const { mapboxgl } = this.iMapApi.exports;
    const opts = assign({}, defaultPopupOptions, options || {});

    // 判断是否为仅单一Popup渲染，则移除其他Popup实例
    if (isBooleanTrue(opts.showSingle)) {
      this.removeAll();
    }
    // 实例化Popup对象
    const popupOptions = {
      closeButton: false,
      closeOnClick: opts.closeOnClick,
      closeOnMove: opts.closeOnMove,
      anchor: opts.anchor,
      offset: opts.offset,
      maxWidth: opts.maxWidth,
    };
    const popup = new mapboxgl.Popup(popupOptions);
    popup.id = id;
    popup.setDOMContent(document.createElement('div'));
    // 添加Popup到地图
    popup.setLngLat(coordinates);
    popup.addTo(this[_map]);
    // 替换Popup的Element对象
    const popupWrapper = popup.getElement();
    popupWrapper.setAttribute('data-id', id);
    popupWrapper.innerHTML = '';

    // 创建组件包的Props属性
    const props = {};
    props.getContainer = () => popupWrapper;
    props.iMapApi = this.iMapApi;
    props.type = 'popup';
    const prefixCls = getPrefixCls('map');
    props.class = [`${prefixCls}-popup`];
    isBooleanFlase(opts.defaultSkin) && props.class.push('no-skin');
    opts.className && props.class.push(opts.className);
    opts.style && (props.style = opts.style);
    opts.slots && (props.slots = opts.slots);
    props.vProps = { popup, data: opts.data || null };
    props.options = opts;
    // 创建Vue组件包实例
    ElementWrapper.newInstance(props, instance => {
      popup._content = popupWrapper.querySelector(`.${prefixCls}-popup .popup-inner-content`);
      popup._instance = instance;
      // 绑定Popup组件对象关闭事件监听
      popup.on('close', () => {
        popup._instance && popup._instance.destroy();
        // 移除Popup的存储对象记录
        this[_popups][popup.id] && delete this[_popups][popup.id];
      });
    });

    // 删除部分原生方法
    const deleteMethods = () => {
      console.error(`Popup对象下的[setDOMContent]、[setHTML]、[setText]函数方法已被禁用，请使用Vue组件的Slots插槽模板进行内容更新！`);
    };
    popup.setDOMContent && (popup.setDOMContent = deleteMethods);
    popup.setHTML && (popup.setHTML = deleteMethods);
    popup.setText && (popup.setText = deleteMethods);
    popup.addTo && (popup.addTo = () => null);
    // 重构原生方法
    const container = popupWrapper.querySelector(`.${prefixCls}-popup`);
    const isClassPass = className => !className || className === `${prefixCls}-popup`;
    popup.addClassName = className => {
      if (isClassPass(className)) return;
      container && addClass(container, className);
    };
    popup.removeClassName = className => {
      if (isClassPass(className)) return;
      container && removeClass(container, className);
    };
    popup.toggleClassName = className => {
      if (isClassPass(className)) return;
      container && container.classList.toggle(className);
    };

    // 存储当前实例的Marker对象
    this[_popups][id] = popup;

    return popup;
  }

  /**
   * 获取指定Id的Popup对象
   * @param {String} id Popup的唯一Id名
   */
  get(id) {
    return id && this[_popups] && this[_popups][id];
  }

  /**
   * 删除指定Id的Popup对象
   * @param {String} id Popup的唯一Id名
   */
  remove(id) {
    const popup = this.get(id);
    popup && popup.remove();
  }

  /**
   * 清空所有的Popup标注对象
   */
  removeAll() {
    if (this.popups && this.popups.length) {
      for (let i = this.popups.length - 1; i >= 0; i--) {
        const popup = this.popups[i];
        this.remove(popup.id);
      }
    }
  }
}

export default Popup;
