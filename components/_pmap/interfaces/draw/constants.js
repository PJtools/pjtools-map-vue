/**
 * @文件说明: 定义Draw绘图的常量
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 16:33:21
 */

export default {
  // 绘制模式名称
  modes: {
    STATIC: 'static',
    SELECT: 'select',
    EDIT: 'edit',
    DRAW_POINT: 'point',
    DRAW_LINE: 'line',
    DRAW_POLYGON: 'polygon',
    DRAW_CIRCLE: 'circle',
    DRAW_RECTANGLE: 'rectangle',
  },

  // 绘制交互的回调事件名
  events: {
    // 绘图模式更新
    MODE_CHANGE: 'draw.modechange',
    // 绘图要素选中更新
    SELECTION_CHANGE: 'draw.selectionchange',
    // 绘图时可活动操作状态 [ trash<垃圾桶> | combineFeatures<合并要素> | uncombineFeatures<拆分复合要素> ]
    ACTIONABLE: 'draw.actionable',
    // 绘图时的数据渲染
    RENDER: 'draw.render',
    // 绘图时的数据删除
    DELETE: 'draw.delete',
    // 绘图时合并要素
    COMBINE_FEATURES: 'draw.combine',
    // 绘图时拆分复合要素
    UNCOMBINE_FEATURES: 'draw.uncombine',
    // 绘制模式的绘制完成
    DRAW_COMPLETE: 'draw.complete',
    // 绘制模式的绘制取消
    DRAW_CANCEL: 'draw.cancel',
    // 绘制模式的单击Click
    DRAW_CLICK: 'draw.click',
    // 绘制模式的MouseMove
    DRAW_MOUSEMOVE: 'draw.mousemove',
  },

  // 绘图图层的数据源前缀
  sources: {
    ID: 'draw-source-collection',
  },

  // Feature要素类型
  types: {
    POLYGON: 'polygon',
    LINE: 'line_string',
    POINT: 'point',
  },

  // GeoJSON类型
  geojsonTypes: {
    FEATURE: 'Feature',
    POLYGON: 'Polygon',
    LINE_STRING: 'LineString',
    POINT: 'Point',
    FEATURE_COLLECTION: 'FeatureCollection',
    MULTI_PREFIX: 'Multi',
    MULTI_POINT: 'MultiPoint',
    MULTI_LINE_STRING: 'MultiLineString',
    MULTI_POLYGON: 'MultiPolygon',
  },

  // Feature标识类型
  meta: {
    FEATURE: 'feature',
    MIDPOINT: 'midpoint',
    VERTEX: 'vertex',
    MOVELINE: 'moveline',
    TEMPLINE: 'templine',
  },

  // 绘制活动状态
  activeStates: {
    ACTIVE: 'true',
    INACTIVE: 'false',
  },
};
