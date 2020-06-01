/**
 * @文件说明: 定义绘图模式的接口访问器
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 11:25:15
 */

import assign from 'lodash/assign';
import { isBooleanTrue } from '../../../../_util/methods-util';
import Constants from '../constants';

const _context = Symbol('ctx');
const _cursorOptions = Symbol('cursorOptions');
const _modeChangeRequest = Symbol('modeChangeRequest');

class ModeInterface {
  get ctx() {
    return this[_context];
  }

  constructor(ctx) {
    this[_context] = ctx;
    this[_cursorOptions] = {
      cursor: null,
      icon: null,
      content: null,
    };
    this[_modeChangeRequest] = null;
  }

  /**
   * 更新地图光标的样式及Tip提示
   * @param {Object} options 光标参数选项
   */
  updateCursor(options = {}) {
    const opts = assign({}, this[_cursorOptions], options);
    const cursorOptions = {};
    cursorOptions.cursor = opts.cursor || null;
    if (opts.icon || opts.content) {
      cursorOptions.tip = {};
      opts.icon && (cursorOptions.tip.icon = opts.icon);
      opts.content && (cursorOptions.tip.content = opts.content);
    }
    this.ctx.cursor.enable(cursorOptions, this.ctx.api);
    this[_cursorOptions] = opts;
  }

  /**
   * 清除地图光标
   */
  clearCursor() {
    this.ctx.cursor.disable(false);
    this[_cursorOptions] = {
      cursor: null,
      icon: null,
      content: null,
    };
  }

  /**
   * 清除当前绘制模式的选中Feature要素
   */
  clearSelectedFeatures() {
    return this.ctx.store.clearSelected();
  }

  /**
   * 设置绘图可活动操作的状态
   * @param {Object} actions 待更新可活动操作状态：[ trash<垃圾桶> | combineFeatures<合并要素> | uncombineFeatures<拆分复合要素> ]
   */
  setActionableState(actions = {}) {
    const newSet = {
      trash: isBooleanTrue(actions.trash),
      combineFeatures: isBooleanTrue(actions.combineFeatures),
      uncombineFeatures: isBooleanTrue(actions.uncombineFeatures),
    };
    return this.ctx.events.actionable(newSet);
  }

  /**
   * 获取当前的绘图模式
   */
  getMode() {
    return this.ctx.events.getMode();
  }

  /**
   * 切换绘图的模式
   * @param {String} mode 待切换的绘图名称
   * @param {Object} options 模式的参数选项
   * @param {Object} eventOptions 更新模式的选项
   */
  changeMode(mode, options = {}, eventOptions = {}) {
    if (!this[_modeChangeRequest]) {
      this[_modeChangeRequest] = requestAnimationFrame(() => {
        this[_modeChangeRequest] = null;
        this.ctx.events.changeMode(mode, options, eventOptions);
      });
    }
    return this;
  }

  /**
   * 创建绘制的Feature要素对象
   * @param {Object} feature Feature要素对象
   */
  newFeature(feature) {
    const geojson = this.ctx.store.getFeatureToGeoJSON(feature);
    return geojson.updateInternalProperty('active', Constants.activeStates.ACTIVE);
  }

  /**
   * 添加绘制的Feature对象
   * @param {Feature} feature 待添加的绘制Feature要素
   */
  addFeature(feature) {
    return this.ctx.store.add(feature);
  }

  /**
   * 删除绘制的Feature对象
   * @param {Array} ids 待删除的Feature要素Id集合
   * @param {Object} options 删除的参数选项
   */
  deleteFeature(ids, options = {}) {
    return this.ctx.store.delete(ids, options);
  }

  /**
   * 指定Id的Feature对象更新为选中状态
   * @param {Array} ids 待选中的Feature要素Id集合
   */
  setSelected(ids) {
    return this.ctx.store.setSelected(ids);
  }

  /**
   * 获取指定Id的Feature对象
   * @param {String} id Feature要素的Id
   */
  getFeature(id) {
    return this.ctx.store.get(id);
  }
}

// ----- 扩展绘图模式的监听事件 -----
/**
 * Mode模式的注册 - 激活入口
 * @param {Object} options 当前模式的参数选项
 */
ModeInterface.prototype.onSetup = function(options = {}) {};

/**
 * 触发Drag时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onDrag = function(state, e) {};

/**
 * 触发Click时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onClick = function(state, e) {};

/**
 * 触发MouseDown时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onMouseDown = function(state, e) {};

/**
 * 触发MouseMove时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onMouseMove = function(state, e) {};

/**
 * 触发MouseUp时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onMouseUp = function(state, e) {};

/**
 * 触发MouseOver时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onMouseOver = function(state, e) {};

/**
 * 触发MouseOut时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onMouseOut = function(state, e) {};

/**
 * 触发KeyUp时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onKeyUp = function(state, e) {};

/**
 * 触发KeyDown时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onKeyDown = function(state, e) {};

/**
 * 触发TouchStart时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onTouchStart = function(state, e) {};

/**
 * 触发TouchMove时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onTouchMove = function(state, e) {};

/**
 * 触发TouchEnd时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onTouchEnd = function(state, e) {};

/**
 * 触发Tap时的响应事件
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Event} e 捕获Event对象
 */
ModeInterface.prototype.onTap = function(state, e) {};

/**
 * 触发Mode模式的销毁 - 释放激活
 * @param {Object} state 模式onSetup时State状态对象
 */
ModeInterface.prototype.onStop = function(state) {};

/**
 * 触发删除选中的Feature矢量要素的事件
 * @param {Object} state 模式onSetup时State状态对象
 */
ModeInterface.prototype.onTrash = function(state) {};

/**
 * 触发合并多个Feature要素为Muti复合形式的事件
 * @param {Object} state 模式onSetup时State状态对象
 */
ModeInterface.prototype.onCombineFeature = function(state) {};

/**
 * 触发拆分Muti复合Feature要素为多个单Feature形式的事件
 * @param {Object} state 模式onSetup时State状态对象
 */
ModeInterface.prototype.onUncombineFeature = function(state) {};

/**
 * 触发已绘制的所有Feature矢量要素对象进行显示渲染，已渲染过的要素则会忽略
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Object} geojson 待渲染的GeoJSON矢量要素对象，其中已渲染的Feature要素则会忽略
 * @param {Function} display 添加到渲染数据源的GeoJSON集合的转化函数
 */
ModeInterface.prototype.toDisplayFeatures = function(state, geojson, display) {};

export default ModeInterface;
