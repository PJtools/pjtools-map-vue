/**
 * @文件说明: Handlers.ZoomInOut 地图鼠标拉框放大/缩小交互
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-20 09:15:42
 */

import assign from 'lodash/assign';
import DOM from '../util/dom';

// 地地图鼠标拉框放大/缩小交互的默认选项参数
const defaultZoomInOutOptions = {
  // 地图缩放模式，可选项：[ in<放大> | out<缩小> ]
  mode: 'in',
};

class ZoomInOut {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    this.map = this.iMapApi && this.iMapApi.map;
    const { mapboxgl } = this.iMapApi.exports;
    this.mapboxgl = mapboxgl;
    // 地图容器对象
    this._container = this.iMapApi.getMapContainer();
    // 地图Canvas容器对象
    this._el = this.iMapApi.getMapCanvasConatainer();
    // 记录交互绑定事件对象
    this._events = {};
    // 鼠标事件执行的对比范围
    this._clickTolerance = 1;
    // 交互的禁用/启用状态
    this._enabled = false;
    // 交互的活动状态
    this._active = false;
  }

  /**
   * 激活地图鼠标拉框放大/缩小交互功能
   * @param {Object} options 交互选项
   */
  enable(options = {}) {
    !this._cursor && (this._cursor = this.iMapApi.Handlers.cursor);
    // 清除历史交互模式的参数选项
    if (this.isEnabled()) {
      this.reset();
      this._removeEvents();
    }
    // 合并选项参数
    this._options = assign({}, defaultZoomInOutOptions, options);
    this._options.mode = ['in', 'out'].indexOf(this._options.mode.toLowerCase()) !== -1 ? this._options.mode.toLowerCase() : 'in';
    // 设置激活模式地图光标
    this._cursor.enable(
      {
        cursor: 'default',
        tip: {
          icon: `zoom-${this._options.mode}`,
          content: `拉框${this._options.mode === 'out' ? '缩小' : '放大'}，Esc键取消`,
        },
      },
      this,
    );
    // 绑定交互事件
    this._events.mousedown = DOM.onEventListener(this._el, 'mousedown', this._handleMapMouseDown.bind(this));
    this._events.keydown = DOM.onEventListener(window.document, 'keydown', this._handleWindowKeyDown.bind(this));
    // 更新状态
    this._enabled = true;
  }

  /**
   * 禁用地图鼠标拉框放大/缩小交互功能
   */
  disable() {
    if (!this.isEnabled()) {
      return;
    }
    // 清除活动状态过程中对象及交互事件
    this.reset();
    this._removeEvents();
    // 清除交互模式的参数选项
    this._options = defaultZoomInOutOptions;
    // 更新状态
    this._enabled = false;
    // 移除光标模式
    this._cursor && this._cursor.disable(false);
  }

  /**
   * 获取当前交互的禁用/启用状态
   */
  isEnabled() {
    return !!this._enabled;
  }

  /**
   * 获取当前交互的活动状态
   */
  isActive() {
    return !!this._active;
  }

  /**
   * 重置地图鼠标拉框放大/缩小交互到初始激活阶段
   */
  reset() {
    // 移除拉框DOM对象
    if (this._box) {
      DOM.remove(this._box);
      this._box = null;
      delete this._box;
    }
    // 激活地图拖拽
    DOM.enableDrag();
    this.map.dragPan && this.map.dragPan.enable();
    // 删除坐标记录对象
    this._startPos && delete this._startPos;
    this._lastPos && delete this._lastPos;
    // 解绑事件
    if (this._events.mousemove) {
      this._events.mousemove.remove();
      delete this._events.mousemove;
    }
    if (this._events.mouseup) {
      this._events.mouseup.remove();
      delete this._events.mouseup;
    }
    // 更新状态
    this._active = false;
  }

  // 执行地图的MouseDown事件
  _handleMapMouseDown(e) {
    // 判断鼠标按钮及禁启用状态
    if (!this.isEnabled() || DOM.mouseButton(e) !== 0) {
      return;
    }
    // 禁用地图拖拽
    DOM.disableDrag(this.map);
    this.map.dragPan && this.map.dragPan.disable();
    // 记录当前鼠标坐标
    const point = DOM.mousePos(this._el, e, this.mapboxgl);
    this._startPos = this._lastPos = point;
    // 绑定事件
    this._events.mousemove = DOM.onEventListener(window.document, 'mousemove', this._handleWindowMouseMove.bind(this));
    this._events.mouseup = DOM.onEventListener(window.document, 'mouseup', this._handleWindowMouseUp.bind(this));
    // 更新状态
    this._active = true;
  }

  // 执行Window的MouseMove事件
  _handleWindowMouseMove(e) {
    if (!this.isActive()) {
      return;
    }
    const point = DOM.mousePos(this._el, e, this.mapboxgl);
    // 判断鼠标移动距离，限制Move事件节流
    if (this._lastPos.equals(point) || (!this._box && point.dist(this._startPos) < this._clickTolerance)) {
      return;
    }
    const p0 = this._startPos;
    this._lastPos = point;
    // 创建拉框的DOM元素
    if (!this._box) {
      this._box = DOM.create('div', 'mapboxgl-boxzoom', this._container);
      this.iMapApi.Evented.fire('zoominout.start', { e, startPos: point });
    }
    // 计算绘制的Box宽度、偏移属性样式
    const minX = Math.min(p0.x, point.x);
    const maxX = Math.max(p0.x, point.x);
    const minY = Math.min(p0.y, point.y);
    const maxY = Math.max(p0.y, point.y);
    DOM.setTransform(this._box, `translate(${minX}px,${minY}px)`);
    this._box.style.width = `${maxX - minX}px`;
    this._box.style.height = `${maxY - minY}px`;
  }

  // 执行Window的MouseUp事件
  _handleWindowMouseUp(e) {
    if (!this.isActive() || DOM.mouseButton(e) !== 0) {
      return;
    }
    const p0 = this._startPos;
    const p1 = DOM.mousePos(this._el, e, this.mapboxgl);
    // 清除鼠标拉框交互时的临时对象
    this.reset();
    DOM.suppressClick();
    // 执行地图的回调事件及缩放
    if (p0.x === p1.x && p0.y === p1.y) {
      this.iMapApi.Evented.fire('zoominout.cancel', { e });
    } else {
      // 根据模式执行缩放计算范围坐标
      let point0 = p0;
      let point1 = p1;
      if (this._options.mode === 'out') {
        // 计算缩放比例
        const pixWidth = Math.abs(p1.x - p0.x);
        const pixHeight = Math.abs(p1.y - p0.y);
        const mapRect = this._container.getBoundingClientRect();
        const zoomFactor = Math.min(mapRect.height / pixHeight, mapRect.width / pixWidth);
        // 获取拉框矩形的中心点
        const mapboxgl = this.mapboxgl;
        const center = new mapboxgl.Point((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        const xmin = center.x - (mapRect.width / 2) * zoomFactor;
        const xmax = center.x + (mapRect.width / 2) * zoomFactor;
        const ymin = center.y - (mapRect.height / 2) * zoomFactor;
        const ymax = center.y + (mapRect.height / 2) * zoomFactor;
        point0 = new mapboxgl.Point(xmin, ymin);
        point1 = new mapboxgl.Point(xmax, ymax);
      }
      // 对地图执行范围缩放动画
      this.map.fitScreenCoordinates(point0, point1, this.iMapApi.getRotate(), { linear: true });
      this.map.once('moveend', () => {
        this.iMapApi.Evented.fire('zoominout.end', { e, startPos: point0, endPos: point1 });
      });
    }
  }

  // 执行键盘Keydown事件
  _handleWindowKeyDown(e) {
    // 判断是否按下ESC取消操作
    if (e && e.keyCode && e.keyCode === 27) {
      this.disable();
      this.iMapApi.Evented.fire('zoominout.cancel', { e });
    }
  }

  // 解绑当前交互的事件绑定
  _removeEvents() {
    const events = this._events || {};
    const keys = Object.keys(events);
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      if (events[key]) {
        events[key].remove();
        delete events[key];
      }
    }
  }
}

export default ZoomInOut;
