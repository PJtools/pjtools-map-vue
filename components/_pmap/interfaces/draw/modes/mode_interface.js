/**
 * @文件说明: 定义绘图模式的接口访问器
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 11:25:15
 */

const _context = Symbol('ctx');

class ModeInterface {
  get ctx() {
    return this[_context];
  }

  constructor(ctx) {
    this[_context] = ctx;
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
