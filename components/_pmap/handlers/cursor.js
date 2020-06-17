/**
 * @文件说明: Handlers.Cursor 地图光标
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-15 13:49:01
 */

import hat from 'hat';
import assign from 'lodash/assign';
import DOM from '../util/dom';
import { isEmpty, isBooleanFlase, isString, isFunction } from '../../_util/methods-util';

// 地图光标的默认选项参数
const defaultCursorOptions = {
  // 地图光标类型
  cursor: null,
  // 是否鼠标跟随提示框
  tip: false,
  // 光标跟随提示框的偏移值
  offset: [0, 0],
};

// 地图光标跟随提示框的默认选项参数
const defaultCursorTooltipOptions = {
  // 样式Class名
  className: null,
  // 提示图标
  icon: null,
  // 提示内容
  content: null,
};

class Cursor {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    // 获取地图Canvas容器对象，确定地图光标的范围
    this._element = iMapApi && iMapApi.getMapCanvasConatainer();
    // 光标实例对象的唯一Id
    this._id = `pjmap_interaction_mouse_tooltip_${hat()}`;
    // 光标的参数选项
    this._options = defaultCursorOptions;
    // 光标的UI交互组件对象
    this.iMapApi && this.iMapApi.addUserInteraction(this._id, 'MouseTooltip');
    // 光标的手动显隐状态
    this._visible = false;
    // 光标的当前关联Handler/Interactions实例对象（需实现统一标准：disable 函数方法）
    this._handler = null;
    // 光标禁用/启用状态
    this._enabled = false;
    // 光标对象的活动状态
    this._active = false;
  }

  get component() {
    if (!this._component) {
      this._component = this.iMapApi.getUserInteraction(this._id);
    }
    return this._component;
  }

  get handler() {
    return this._handler || null;
  }

  /**
   * 激活地图光标
   * @param {Object} options 地图光标的选项
   * @param {Class} handler 光标关联的交互对象
   */
  enable(options = {}, handler = null) {
    // 设置当前光标模式的选项
    this._options = assign({}, defaultCursorOptions, options);
    if (!isBooleanFlase(this._options.tip)) {
      const tip = isString(this._options.tip) ? { content: this._options.tip } : this._options.tip;
      this._options.tip = assign({}, defaultCursorTooltipOptions, tip);
    }
    // 判断是否有历史关联交互对象则清除
    if (this._handler) {
      if (handler !== this._handler && this._handler.disable && isFunction(this._handler.disable)) {
        this._handler.disable();
      }
      this._handler = null;
    }
    // 设置当前地图光标模式
    this._setMapCursorStyle(this._options.cursor);
    // 判断是否需激活光标提示框组件
    if (this.component) {
      this.component.enable(this._options.tip);
      // 绑定交互事件
      this._eventMove = DOM.onEventListener(window.document, 'mousemove', this._handleMapCursorMouseMove.bind(this));
      this.iMapApi.on(`${this._id}.mouseover`, 'mouseover', this._handleMapCursorMouseOver.bind(this));
      this.iMapApi.on(`${this._id}.mouseout`, 'mouseout', this._handleMapCursorMouseOut.bind(this));
    }
    handler && (this._handler = handler);
    // 调整状态
    this._visible = true;
    this._enabled = true;
    this._active = true;
  }

  /**
   * 禁用地图光标
   */
  disable(autoHandlerDisable = true) {
    if (!this.isEnabled()) {
      return;
    }
    // 移除光标提示框组件
    if (this.component) {
      this.component.disable();
      // 解绑事件
      if (this._eventMove) {
        this._eventMove.remove();
        delete this._eventMove;
      }
      this.iMapApi.off(`${this._id}.mouseover`);
      this.iMapApi.off(`${this._id}.mouseout`);
    }
    // 清除当前地图光标模式
    this._setMapCursorStyle(null);
    // 清除地图光标模式的参数选项
    this._options = defaultCursorOptions;
    // 还原状态
    this._visible = false;
    this._enabled = false;
    this._active = false;
    // 判断是否有关联交互对象
    if (this._handler) {
      if (!isBooleanFlase(autoHandlerDisable) && this._handler.disable && isFunction(this._handler.disable)) {
        this._handler.disable();
      }
      this._handler = null;
    }
  }

  /**
   * 获取地图光标当前的禁用/启用状态
   */
  isEnabled() {
    return !!this._enabled;
  }

  /**
   * 获取地图光标当前的活动状态
   */
  isActive() {
    return !!this._active;
  }

  /**
   * 设置激活地图光标的显隐状态
   * @param {Boolean} visible 显隐状态
   */
  setCursorVisible(visible = true) {
    if (this._enabled && this._component) {
      this._component.updateVisible(visible);
      this._visible = visible;
    }
  }

  /**
   * 更新当前地图光标提示框的文本内容
   * @param {String} content 待更新的光标提示框内容
   */
  updateContent(content) {
    if (this._enabled && this._component) {
      this._component.updateMouseContent(content);
    }
  }

  /**
   * 更新当前地图光标提示框的Icon图标
   * @param {String} icon 待更新的光标提示框Icon图标
   */
  updateIcon(icon) {
    if (this._enabled && this._component) {
      this._component.updateMouseIcon(icon);
    }
  }

  // 设置地图光标的样式
  _setMapCursorStyle(cursor) {
    if (!this._element) {
      return;
    }
    if (cursor) {
      this._element.style.setProperty('cursor', cursor.trim(), 'important');
    } else {
      this._element.style.removeProperty('cursor');
      if (isEmpty(this._element.style.cssText)) {
        this._element.removeAttribute('style');
      }
    }
  }

  // 执行地图光标的MouseMove事件
  _handleMapCursorMouseMove(e) {
    if (!this._enabled || !this._active || !this._component) {
      return;
    }
    const point = DOM.mousePos(this._element, e);
    let left = this._options.cursor && this._options.cursor === 'default' ? 18 : 12;
    let top = this._options.cursor && this._options.cursor === 'default' ? 6 : 4;
    this._options.offset && this._options.offset[0] && (left += Number(this._options.offset[0]));
    this._options.offset && this._options.offset[1] && (top += Number(this._options.offset[1]));
    this._component.updateMousePostion({
      left: `${point.x + left}px`,
      top: `${point.y + top}px`,
    });
  }

  // 执行地图光标的MouseOver事件
  _handleMapCursorMouseOver() {
    if (this._enabled && this._component) {
      this._active = true;
      this._visible && this._component.updateVisible(true);
    }
  }

  // 执行地图光标的MouseOut事件
  _handleMapCursorMouseOut() {
    if (this._enabled && this._component) {
      this._active = false;
      this._visible && this._component.updateVisible(false);
    }
  }
}

export default Cursor;
