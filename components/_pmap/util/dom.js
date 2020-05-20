/**
 * @文件说明: 构建 DOM 对象的操作常见函数
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-20 09:52:24
 */

import addDOMEventListener from 'add-dom-event-listener';

const docStyle = window.document.documentElement.style;
const testProp = function(props) {
  if (!docStyle) return props[0];
  for (let i = 0; i < props.length; i++) {
    if (props[i] in docStyle) {
      return props[i];
    }
  }
  return props[0];
};
const selectProp = testProp(['userSelect', 'MozUserSelect', 'WebkitUserSelect', 'msUserSelect']);
const transformProp = testProp(['transform', 'WebkitTransform']);
const suppressClick = function(e) {
  e.preventDefault();
  e.stopPropagation();
  window.removeEventListener('click', suppressClick, true);
};
let userSelect;

const DOM = {
  /**
   * 动态创建DOM对象
   * @param {String} tagName HTML标签名
   * @param {String} className Class类名
   * @param {HTMLElement} container 待追加到DOM父级对象
   */
  create(tagName, className, container) {
    const el = window.document.createElement(tagName);
    if (className !== undefined) {
      el.className = className;
    }
    container && container.appendChild(el);
    return el;
  },

  /**
   * 禁用浏览器的原生Drag操作
   *
   */
  disableDrag() {
    if (docStyle && selectProp) {
      userSelect = docStyle[selectProp];
      docStyle[selectProp] = 'none';
    }
  },

  /**
   * 启用浏览器的原生Drag操作
   */
  enableDrag() {
    if (docStyle && selectProp) {
      docStyle[selectProp] = userSelect;
    }
  },

  /**
   * 设定指定HTML Element对象的样式transform属性
   * @param {HTMLElement} el 待设定的DOM对象
   * @param {string} value 待设定的属性值
   */
  setTransform(el, value) {
    el.style[transformProp] = value;
  },

  /**
   * 绑定DOM对象的事件监听对象
   * Example：
   * const event = onEventListener(document, 'click', () => {});
   * event.remove();
   *
   * @param {HTMLElement} target 待绑定的DOM对象
   * @param {String} eventType 事件类型
   * @param {Function} cb 事件函数
   * @param {Object} option 事件的选项参数
   */
  onEventListener(target, eventType, cb, option) {
    return addDOMEventListener(target, eventType, cb, option);
  },

  /**
   * 获取指定DOM对象的鼠标Mouse相对偏移量
   * @param {HTMLElement} el DOM对象
   * @param {Event} e 事件Event对象
   * @param {MapboxGL} mapboxgl MapboxGL对象，设定则返回mapboxgl.Point对象
   */
  mousePos(el, e, mapboxgl) {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - el.clientLeft;
    const y = e.clientY - rect.top - el.clientTop;
    return mapboxgl ? new mapboxgl.Point(x, y) : { x, y };
  },

  /**
   * 获取鼠标的按键类型，0：左键（正键） 1：中键 2：右键（反键）
   * @param {Event} e 事件Event对象
   */
  mouseButton(e) {
    if (e.type === 'mousedown' || e.type === 'mouseup') {
      if (
        typeof window.InstallTrigger !== 'undefined' &&
        e.button === 2 &&
        e.ctrlKey &&
        window.navigator.platform.toUpperCase().indexOf('MAC') >= 0
      ) {
        return 0;
      }
      return e.button;
    }
    return null;
  },

  /**
   * 阻止鼠标单击的事件默认行为与冒泡
   */
  suppressClick() {
    window.addEventListener('click', suppressClick, true);
    window.setTimeout(() => {
      window.removeEventListener('click', suppressClick, true);
    }, 0);
  },

  /**
   * 删除指定的DOM对象
   * @param {HTMLElement} el 待移除的DOM对象
   */
  remove(el) {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
};

export default DOM;
