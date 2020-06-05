/**
 * @文件说明: Draw.Modes.Static 静态模式（默认）
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 18:15:34
 */

const StaticMode = {};

// Mode模式的注册 - 激活入口
StaticMode.onSetup = function() {
  // 清空所有选中的要素
  this.clearSelectedFeatures();
  // 禁用所有可活动的操作
  this.setActionableState({});
  // 设置绘图为非活动状态
  this.ctx.setActive(false);

  return {};
};

// 触发已绘制的所有Feature矢量要素对象进行显示渲染，已渲染过的要素则会忽略
StaticMode.toDisplayFeatures = function(state, geojson, display) {
  display(geojson);
};

export default StaticMode;
