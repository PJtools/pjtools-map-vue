/**
 * @文件说明: 定义Draw绘图的常量
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 16:33:21
 */

export default {
  // 绘制模式名称
  modes: {
    STATIC: 'static',
    SIMPLE_SELECT: 'simple_select',
    DIRECT_SELECT: 'direct_select',
    DRAW_LINE_STRING: 'draw_line_string',
    DRAW_POLYGON: 'draw_polygon',
    DRAW_POINT: 'draw_point',
  },

  // 绘图图层的数据源前缀
  sources: {
    // 绘制临时数据源
    HOT: 'pjmap-draw-hot',
    // 绘制完成数据源
    COLD: 'pjmap-draw-cold',
  },

  // Feature要素类型
  types: {
    POLYGON: 'polygon',
    LINE: 'line_string',
    POINT: 'point',
  },

  // Feature标识类型
  meta: {
    FEATURE: 'feature',
    MIDPOINT: 'midpoint',
    VERTEX: 'vertex',
  },
};
