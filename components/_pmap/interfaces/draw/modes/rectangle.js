/**
 * @文件说明: Draw.Modes.Rectangle 绘制“矩形”模式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-02 14:19:23
 */

import assign from 'lodash/assign';
import round from 'lodash/round';
import Constants from '../constants';
import { defaultDrawSetupMethodsSetup } from './point';
import { calculatePolygonArea } from './polygon';
import CircleMode from './circle';
import { isBooleanTrue, isEmpty, isNumeric } from '../../../../_util/methods-util';

const DEFAULT_CURSOR_OPTIONS = {
  cursor: 'default',
  icon: 'highlight',
  content: '单击确定起点，ESC键取消',
  clicked: '再次单击，绘制结束',
};

// 计算当前绘制Rectangle矩形要素的面积与周长
export const calculateRectangleArea = function(context, coordinates, length, width) {
  let measure = {};
  // 计算Polygon的面积和周长
  const polygonMeasure = calculatePolygonArea(context, coordinates);
  if (polygonMeasure && polygonMeasure.measure) {
    measure = { ...polygonMeasure.measure };
  }
  // 追加矩形的长宽
  measure.length = {};
  measure.length.distance = length < 1 ? length * 1000 : length;
  measure.length.round = round(measure.length.distance, 2);
  measure.length.unit = length < 1 ? 'm' : 'km';
  measure.length.unitCN = length < 1 ? '米' : '千米';
  if (width) {
    measure.width = {};
    measure.width.distance = width < 1 ? width * 1000 : width;
    measure.width.round = round(measure.width.distance, 2);
    measure.width.unit = width < 1 ? 'm' : 'km';
    measure.width.unitCN = width < 1 ? '米' : '千米';
  }

  return {
    measure,
  };
};

const RectangleMode = {};

// Mode模式的注册 - 激活入口
RectangleMode.onSetup = function(options = {}) {
  // 合并绘制Rectangle模式的光标
  const cursorOptions = assign({}, DEFAULT_CURSOR_OPTIONS, (options && options.cursor) || {});
  options && (options.cursor = cursorOptions);
  // 执行默认初始化
  defaultDrawSetupMethodsSetup(this, options.cursor);
  // 判定是否开启正方形模式
  options.square = isBooleanTrue(options.square);
  // 判定是否开启设定的长宽模式
  options.length = !isEmpty(options.length) && isNumeric(options.length) ? Number(options.length) : null;
  options.length = options.length && options.length > 0 ? options.length : null;
  // 判定是否开启正方形模式，则矩形宽度直接取长度
  if (options.square) {
    options.width = options.length;
  } else {
    options.width = !isEmpty(options.width) && isNumeric(options.width) ? Number(options.width) : null;
    options.width = options.width && options.width > 0 ? options.width : null;
  }

  let renderRequest;
  return {
    options,
    // 当前单击时间戳
    clickTime: null,
    // 当前单击的坐标点
    clickCoordinates: null,
    // MouseMove事件的节流刷新
    handleThrottleMouseMove: (state, e) => {
      if (!renderRequest) {
        renderRequest = requestAnimationFrame(() => {
          renderRequest = null;
          this.throttleMouseMove.call(this, state, e);
        });
      }
    },
  };
};

// 触发已绘制的所有Feature矢量要素对象进行显示渲染
RectangleMode.toDisplayFeatures = CircleMode.toDisplayFeatures;

// Mode模式 - 取消释放
RectangleMode.onStop = CircleMode.onStop;

// 触发删除选中的Feature矢量要素
RectangleMode.onTrash = CircleMode.onTrash;

// 触发Tap/Click时的响应事件
RectangleMode.onTap = RectangleMode.onClick = CircleMode.onClick;

// 触发MouseMove时的响应事件
RectangleMode.onMouseMove = function(state, e) {
  state.handleThrottleMouseMove && state.handleThrottleMouseMove(state, e);
};

// 触发键盘KeyUp时的响应事件
RectangleMode.onKeyUp = CircleMode.onKeyUp;

// Mode模式 - 绘制完成
RectangleMode.onCompleted = function(geojson) {
  const width = geojson.properties['draw:polygon'] === Constants.modes.DRAW_RECTANGLE ? geojson.properties['draw:width'] : null;
  // 计算绘制Rectangle要素的量算
  const measure = calculateRectangleArea(this, geojson.geometry.coordinates, geojson.properties['draw:length'], width);
  // 驱动事件回调
  this.ctx.api.fire(Constants.events.DRAW_COMPLETE, {
    mode: this.getMode(),
    feature: geojson,
    ...measure,
  });
  // 切换到“选取”模式
  this.changeMode(Constants.modes.SELECT, {
    featureIds: [geojson.id],
  });
};

// Mode模式 - 绘制取消
RectangleMode.onCancel = CircleMode.onCancel;

// <自定义函数>初始创建绘制模式的Feature对象
RectangleMode.initStateDrawFeature = function(state) {
  const polygon = this.newFeature({
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [],
    },
  });
  polygon.updateInternalProperty('polygon', state.options.square ? 'square' : Constants.modes.DRAW_RECTANGLE);
  state.polygon = polygon;
  state.polygon.completed = false;
  this.addFeature(polygon);
  // 创建临时Vertex节点要素对象
  const vertex = this.newFeature({
    geometry: {
      type: Constants.geojsonTypes.MULTI_POINT,
      coordinates: [],
    },
  });
  vertex.updateInternalProperty('meta', Constants.meta.VERTEX);
  vertex.updateInternalProperty('pid', state.polygon.id);
  state.vertex = vertex;
  this.addFeature(vertex);
  // 创建临时Move时Line要素对象
  const moveline = this.newFeature({
    geometry: {
      type: Constants.geojsonTypes.LINE_STRING,
      coordinates: [],
    },
  });
  moveline.updateInternalProperty('meta', Constants.meta.MOVELINE);
  moveline.updateInternalProperty('pid', state.polygon.id);
  state.moveline = moveline;
  this.addFeature(moveline);
};

// <自定义函数>触发单击地图的任意地方
RectangleMode.clickAnywhere = function(state, e) {
  const coordinates = [e.lngLat.lng, e.lngLat.lat];
  // 重新记录单击时间戳和坐标点
  state.clickTime = new Date().valueOf();
  state.clickCoordinates = coordinates;
  // 判定是否还未创建起始点
  if (!state.vertex.features || !state.vertex.features.length) {
    // 更新添加Vertex节点要素坐标点
    const vertexs = state.vertex.getCoordinates();
    vertexs.push(coordinates);
    state.vertex.setCoordinates(vertexs);
    // 更新Rectangle/Square矩形要素的属性
    state.polygon.updateInternalProperty('length', 0);
    !state.options.square && state.polygon.updateInternalProperty('width', 0);

    // 判定是否有设定初始固定长宽模式，则直接绘制完成
    if (this.isInitRectangleLengthWidth(state)) {
      // 根据起点与矩形长宽获取要素坐标点
      const rectangle = this.getRectangleByLengthWidth(
        coordinates,
        state.options.length,
        state.options.square ? state.options.length : state.options.width,
      );
      // 更新矩形要素的坐标
      const rectangleCoordinates = [...rectangle.coordinates];
      rectangleCoordinates.splice(rectangleCoordinates.length - 1, 1);
      state.polygon.setCoordinates([rectangleCoordinates]);
      state.polygon.updateInternalProperty('length', rectangle.length);
      !state.options.square && state.polygon.updateInternalProperty('width', rectangle.width);
      // 结束绘制
      this.doubleClick(state);
    } else {
      // 增加Rectangle要素的坐标点
      state.polygon.updateCoordinate(`0.0`, coordinates[0], coordinates[1]);
      // 更新Rectangle的MoveLine线要素的起始坐标
      state.moveline.setCoordinates([coordinates]);
      // 更新鼠标提示
      state.options.cursor.clicked && this.updateCursor({ content: state.options.cursor.clicked });

      // 触发执行绘制单击时的回调事件
      this.ctx.api.fire(Constants.events.DRAW_CLICK, {
        e,
        mode: this.getMode(),
        feature: state.polygon.toGeoJSON(),
      });
    }
  } else {
    this.doubleClick(state);
  }
};

// <自定义函数>判定doubleClick时的响应事件
RectangleMode.doubleClick = CircleMode.doubleClick;

// <自定义函数>判定是否为DoubleClick双击事件
RectangleMode.isDoubleClick = CircleMode.isDoubleClick;

// <自定义函数>触发MouseMove事件的节流响应
RectangleMode.throttleMouseMove = function(state, e) {
  if (!state.moveline) {
    return;
  }

  const coordinates = [e.lngLat.lng, e.lngLat.lat];
  const start = state.vertex.features[0].coordinates;
  let rectangle = null;
  // 判断是否为正方形模式
  if (state.options.square) {
    rectangle = this.getSquareByCoordinates(start, coordinates);
  } else {
    rectangle = this.getRectangleByCoordinates(start, coordinates);
  }
  // 更新临时移动MoveLine要素的坐标
  state.moveline.setCoordinates(rectangle.coordinates);
  // 更新Rectangle要素的坐标
  const rectangleCoordinates = [...rectangle.coordinates];
  rectangleCoordinates.splice(rectangleCoordinates.length - 1, 1);
  state.polygon.setCoordinates([rectangleCoordinates]);
  state.polygon.updateInternalProperty('length', rectangle.length);
  !state.options.square && state.polygon.updateInternalProperty('width', rectangle.width);

  // 计算绘制Move的临时Circle要素的量算
  const polygonFeature = state.polygon.toGeoJSON();
  const measure = calculateRectangleArea(this, polygonFeature.geometry.coordinates, rectangle.length, !state.options.square ? rectangle.width : null);
  // 触发执行绘制Move时的回调事件
  this.ctx.api.fire(Constants.events.DRAW_MOUSEMOVE, {
    e,
    mode: this.getMode(),
    feature: polygonFeature,
    ...measure,
  });
};

// <自定义函数>移除临时移动MoveLine要素和节点要素
RectangleMode.deleteMoveLineAndVertex = CircleMode.deleteMoveLineAndVertex;

// <自定义函数>判断是否开启固定长宽设定模式
RectangleMode.isInitRectangleLengthWidth = function(state) {
  if (state.options.square) {
    return state.options.length !== null;
  } else {
    return state.options.length !== null && state.options.width !== null;
  }
};

// <自定义函数>根据起始点与对角点坐标获取矩形要素坐标
RectangleMode.getRectangleByCoordinates = function(start, coordinates) {
  const iMapApi = this.ctx.api.iMapApi;
  const { turf } = iMapApi.exports;
  // 生成矩形坐标点
  const rectangleCoordinates = [start, [coordinates[0], start[1]], coordinates, [start[0], coordinates[1]], start];
  // 计算长度和宽度的距离
  const line = turf.lineString([iMapApi.toWGS84(rectangleCoordinates[0]), iMapApi.toWGS84(rectangleCoordinates[1])]);
  const length = turf.length(line, { units: 'kilometers' });
  const widthLine = turf.lineString([iMapApi.toWGS84(rectangleCoordinates[1]), iMapApi.toWGS84(rectangleCoordinates[2])]);
  const width = turf.length(widthLine, { units: 'kilometers' });

  return {
    coordinates: rectangleCoordinates,
    length,
    width,
  };
};

// <自定义函数>根据起始点与对角点坐标获取正方形要素坐标
RectangleMode.getSquareByCoordinates = function(start, coordinates, options = {}) {
  const iMapApi = this.ctx.api.iMapApi;
  const { turf } = iMapApi.exports;
  // 获取矩形的长宽
  const rectangle = this.getRectangleByCoordinates(start, coordinates);
  // 判断长宽的距离，取较长的边为基准
  const length = isBooleanTrue(options.min)
    ? Math.min(Math.abs(rectangle.length), Math.abs(rectangle.width))
    : Math.max(Math.abs(rectangle.length), Math.abs(rectangle.width));
  // 根据长度重新获取对角点坐标
  const lengthFeature = turf.destination(iMapApi.toWGS84(start), length, coordinates[0] - start[0] > 0 ? 90 : -90, { units: 'kilometers' });
  const lengthPoint = turf.getCoord(lengthFeature);
  const widthFeature = turf.destination(lengthPoint, length, coordinates[1] - start[1] > 0 ? 0 : 180, { units: 'kilometers' });
  const widthPoint = turf.getCoord(widthFeature);
  const diagonal = iMapApi.fromWGS84(widthPoint);

  return {
    coordinates: [start, [diagonal[0], start[1]], diagonal, [start[0], diagonal[1]], start],
    length,
  };
};

// <自定义函数>根据起始点与长宽获取矩形要素坐标
RectangleMode.getRectangleByLengthWidth = function(coordinates, length, width) {
  const iMapApi = this.ctx.api.iMapApi;
  const { turf } = iMapApi.exports;
  // 根据长度重新获取对角点坐标
  const lengthFeature = turf.destination(iMapApi.toWGS84(coordinates), length, 90, { units: 'kilometers' });
  const lengthPoint = turf.getCoord(lengthFeature);
  const widthFeature = turf.destination(lengthPoint, width, 180, { units: 'kilometers' });
  const widthPoint = turf.getCoord(widthFeature);
  const diagonal = iMapApi.fromWGS84(widthPoint);

  return {
    coordinates: [coordinates, [diagonal[0], coordinates[1]], diagonal, [coordinates[0], diagonal[1]], coordinates],
    length,
    width,
  };
};

export default RectangleMode;
