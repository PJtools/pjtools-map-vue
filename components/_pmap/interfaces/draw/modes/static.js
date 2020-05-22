/**
 * @文件说明: Draw.Modes.Static 静态模式（默认）
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 18:15:34
 */

const StaticMode = {};

/**
 * Mode模式的注册 - 激活入口
 */
StaticMode.onSetup = function() {
  return {};
};

/**
 * 触发已绘制的所有Feature矢量要素对象进行显示渲染，已渲染过的要素则会忽略
 * @param {Object} state 模式onSetup时State状态对象
 * @param {Object} geojson 待渲染的GeoJSON矢量要素对象，其中已渲染的Feature要素则会忽略
 * @param {Function} display 添加到渲染数据源的GeoJSON集合的转化函数
 */
StaticMode.toDisplayFeatures = function(state, geojson, display) {
  display(geojson);
};

export default StaticMode;
