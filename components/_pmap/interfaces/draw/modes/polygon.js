/**
 * @文件说明: Draw.Modes.Polygon 绘制“多边形面”模式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-29 18:18:42
 */

import assign from 'lodash/assign';
import round from 'lodash/round';
import Constants from '../constants';
import { isVertex, isEscapeKey, isEnterKey } from '../libs/common_selectors';
import isEventAtCoordinates from '../libs/is_event_at_coordinates';
import { defaultDrawSetupMethodsSetup, defaultDrawSetupMethodsStop } from './point';
import { calculateLineDistance } from './line';

const DEFAULT_CURSOR_OPTIONS = {
  cursor: 'default',
  icon: 'highlight',
  content: '单击确定起点，ESC键取消',
  clicked: '单击绘制节点，双击结束',
};

// 计算当前绘制Polygon面要素的面积与周长
export const calculatePolygonArea = function(context, coordinates) {
  if (!coordinates || coordinates.length < 1) {
    return {};
  }
  const iMapApi = context.ctx.api.iMapApi;
  const { turf } = iMapApi.exports;
  const wgs84Coordinates = iMapApi.toWGS84(coordinates);
  // 循环计算周长
  let distance = 0;
  wgs84Coordinates &&
    wgs84Coordinates.map(coordinate => {
      if (coordinate.length > 2) {
        coordinate.length === 3 && coordinate.splice(coordinate.length - 1, 1);
        const measure = calculateLineDistance(context, coordinate);
        measure && measure.measure && measure.measure.line && (distance += measure.measure.line.distance);
      }
    });
  const measure = {};
  if (distance > 0) {
    const length = distance < 1 ? distance * 1000 : distance;
    measure.perimeter = {
      distance: length,
      round: round(length, 2),
      unit: distance < 1 ? 'm' : 'km',
      unitCN: distance < 1 ? '米' : '公里',
    };
  }
  // 判定是否面的坐标点是否超过3个
  if (wgs84Coordinates && wgs84Coordinates[0] && wgs84Coordinates[0].length > 3) {
    // 计算面积
    const polygon = turf.polygon(wgs84Coordinates);
    const area = turf.area(polygon);
    measure.polygon = {
      area: area >= 1000 ? area / 1000 : area,
      round: area,
      unit: area >= 1000 ? 'km²' : '㎡',
      unitCN: area >= 1000 ? '平方千米' : '平方米',
    };
    measure.polygon.round = round(measure.polygon.area, 2);
  }

  return {
    measure,
  };
};

const PolygonMode = {};

// Mode模式的注册 - 激活入口
PolygonMode.onSetup = function(options = {}) {
  // 合并绘制Polygon模式的光标
  const cursorOptions = assign({}, DEFAULT_CURSOR_OPTIONS, (options && options.cursor) || {});
  options && (options.cursor = cursorOptions);
  // 执行默认初始化
  defaultDrawSetupMethodsSetup(this, options.cursor);

  let renderRequest;
  return {
    options,
    // 当前节点的索引值
    currentVertexIndex: 0,
    // 当前单击时间戳
    clickTime: null,
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
PolygonMode.toDisplayFeatures = function(state, geojson, display) {
  const isActiveVertexPoint = state && state.vertex && state.vertex.id === geojson.id;
  const isActiveTempLine = state && state.templine && state.templine.id === geojson.id;
  const isActiveMoveLine = state && state.moveline && state.moveline.id === geojson.id;
  const isActivePolygon = state && state.polygon && state.polygon.id === geojson.id;

  // 判断是否为当前绘制<活动状态>的节点要素、Move移动线要素、TempLine线要素、Polygon面要素
  if (isActiveVertexPoint || isActiveTempLine || isActiveMoveLine || isActivePolygon) {
    if (geojson.properties['draw:active'] === Constants.activeStates.INACTIVE) {
      isActiveVertexPoint && state.vertex.updateInternalProperty('active', Constants.activeStates.ACTIVE);
      isActiveTempLine && state.templine.updateInternalProperty('active', Constants.activeStates.ACTIVE);
      isActiveMoveLine && state.moveline.updateInternalProperty('active', Constants.activeStates.ACTIVE);
      isActivePolygon && state.polygon.updateInternalProperty('active', Constants.activeStates.ACTIVE);
      geojson.properties['draw:active'] = Constants.activeStates.ACTIVE;
    }
    // 判断是否绘制完成
    if (isActivePolygon && state.polygon && state.polygon.completed === true) {
      // 修改当前绘制的Feature为非活动状态
      if (geojson.properties['draw:active'] === Constants.activeStates.ACTIVE) {
        geojson.properties['draw:active'] = Constants.activeStates.INACTIVE;
        state.polygon.updateInternalProperty('active', Constants.activeStates.INACTIVE);
      }
      display(geojson);
      this.onCompleted(geojson);
      return;
    }
  }
  display(geojson);
};

// Mode模式 - 取消释放
PolygonMode.onStop = function(state) {
  // 移除当前绘制<活动状态>的临时线与节点要素
  this.deleteMoveLineAndVertex(state);
  // 移除当前绘制<活动状态>未完成的Polygon面要素
  if (state.polygon && !state.polygon.completed) {
    this.deleteFeature([state.polygon.id], { silent: true });
    delete state.polygon;
    // 驱动事件回调
    this.ctx.api.fire(Constants.events.DRAW_CANCEL, {
      mode: this.getMode(),
    });
  }
  // 执行默认取消释放
  defaultDrawSetupMethodsStop(this);
  // 重置当前绘制Polygon要素的节点索引
  state.currentVertexIndex = 0;
  // 重置当前单击的时间戳
  state.clickTime = null;
};

// 触发删除选中的Feature矢量要素
PolygonMode.onTrash = function(state) {
  this.onCancel(state);
};

// 触发Tap/Click时的响应事件
PolygonMode.onTap = PolygonMode.onClick = function(state, e) {
  // 判断是否未构建<活动状态>的Polygon要素，则进行创建
  if (!state || !state.polygon) {
    const polygon = this.newFeature({
      geometry: {
        type: Constants.geojsonTypes.POLYGON,
        coordinates: [],
      },
    });
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
    // 创建临时Outline边线要素对象
    const templine = this.newFeature({
      geometry: {
        type: Constants.geojsonTypes.LINE_STRING,
        coordinates: [],
      },
    });
    templine.updateInternalProperty('meta', Constants.meta.TEMPLINE);
    templine.updateInternalProperty('pid', state.polygon.id);
    state.templine = templine;
    this.addFeature(templine);
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
    // 重置当前节点的索引值
    state.currentVertexIndex = 0;
    // 重置单击的时间戳
    state.clickTime = new Date().valueOf();
  }
  // 设置绘图为活动状态
  this.ctx.setActive(true);

  // 判断是否进行双击判定
  if (this.isDoubleClick(state, e)) {
    this.doubleClick(state);
    return;
  }

  // 判断是否单击在绘制的节点要素上，则忽略
  if (isVertex(e)) {
    return;
  }
  // 绘制单击Click事件
  this.clickAnywhere(state, e);
};

// 触发MouseMove时的响应事件
PolygonMode.onMouseMove = function(state, e) {
  state.handleThrottleMouseMove && state.handleThrottleMouseMove(state, e);
};

// 触发键盘KeyUp时的响应事件
PolygonMode.onKeyUp = function(state, e) {
  // 判断是否输入Esc键则取消
  if (isEscapeKey(e)) {
    this.onCancel(state);
  } else if (isEnterKey(e)) {
    // 判定是否输入Enter键则完成
    this.doubleClick(state);
  }
};

// Mode模式 - 绘制完成
PolygonMode.onCompleted = function(geojson) {
  // 计算绘制Move的临时线要素的量算
  const measure = calculatePolygonArea(this, geojson.geometry.coordinates);
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
PolygonMode.onCancel = function(state) {
  // 移除当前绘制<活动状态>的临时线与节点要素
  this.deleteMoveLineAndVertex(state);
  // 移除当前绘制<活动状态>的Polygon面要素
  if (state.polygon) {
    this.deleteFeature([state.polygon.id], { silent: true });
    delete state.polygon;
  }
  // 驱动事件回调
  this.ctx.api.fire(Constants.events.DRAW_CANCEL, {
    mode: this.getMode(),
  });
  // 切换到“选取”模式
  this.changeMode(Constants.modes.SELECT);
};

// <自定义函数>触发单击地图的任意地方
PolygonMode.clickAnywhere = function(state, e) {
  const coordinates = [e.lngLat.lng, e.lngLat.lat];
  // 更新添加Vertex节点要素坐标点
  const vertexs = state.vertex.getCoordinates();
  vertexs.push(coordinates);
  state.vertex.setCoordinates(vertexs);
  // 增加Polygon面要素坐标点
  state.polygon.updateCoordinate(`0.${state.currentVertexIndex}`, coordinates[0], coordinates[1]);
  // 更新Polygon面的临时边线坐标
  state.templine.updateCoordinate(state.currentVertexIndex, coordinates[0], coordinates[1]);
  // 更新Polygon面的MoveLine线要素的起始坐标
  state.moveline.setCoordinates(vertexs.length > 2 ? [coordinates, vertexs[0]] : [coordinates]);
  // 更新当前节点的索引
  state.currentVertexIndex++;
  // 重新记录单击时间戳
  state.clickTime = new Date().valueOf();
  // 绘制要素的测量数据
  let measure = {};
  const polygonFeature = state.polygon.toGeoJSON();
  // 判定是否绘制的为起始点，则更新鼠标提示
  if (state.polygon.coordinates && state.polygon.coordinates[0] && state.polygon.coordinates[0].length === 1) {
    state.options.cursor.clicked && this.updateCursor({ content: state.options.cursor.clicked });
  } else if (state.polygon && state.polygon.coordinates[0].length > 1) {
    measure = calculatePolygonArea(this, polygonFeature.geometry.coordinates);
  }

  // 触发执行绘制单击时的回调事件
  this.ctx.api.fire(Constants.events.DRAW_CLICK, {
    e,
    mode: this.getMode(),
    feature: state.polygon.toGeoJSON(),
    ...measure,
  });
};

// <自定义函数>判定doubleClick时的响应事件
PolygonMode.doubleClick = function(state) {
  // 判断当前绘制<活动状态>的Polygon要素坐标是否绘制大于2个点
  if (state.vertex && state.vertex.features && state.vertex.features.length > 2) {
    // 强制刷新Line线段要素
    this.ctx.store.featureChanged(state.polygon.id);
    // 移除当前绘制<活动状态>的临时线与节点要素
    this.deleteMoveLineAndVertex(state);
    // 更新状态
    state.polygon.completed = true;
  } else {
    // 绘制无效则进行清除
    this.onCancel(state);
  }
};

// <自定义函数>判定是否为DoubleClick双击事件
PolygonMode.isDoubleClick = function(state, e) {
  const timestamp = new Date().valueOf();
  if (timestamp - state.clickTime < 300 && state.polygon && state.polygon.coordinates.length) {
    const coordinates = state.polygon.coordinates[0];
    if (coordinates && isEventAtCoordinates(e, coordinates[coordinates.length - 1])) {
      return true;
    }
  }
  return false;
};

// <自定义函数>触发MouseMove事件的节流响应
PolygonMode.throttleMouseMove = function(state, e) {
  if (!state.moveline) {
    return;
  }
  const coordinates = [e.lngLat.lng, e.lngLat.lat];
  // 更新临时MoveLine线要素的截止坐标
  state.moveline.updateCoordinate(1, coordinates[0], coordinates[1]);
  // 判定是否绘制的节点至少有2个，则可形成Polygon
  if (state.currentVertexIndex > 1) {
    const startPolygonCoordinates = state.polygon.coordinates[0][0];
    // 增加闭合线段的坐标
    state.moveline.updateCoordinate(2, startPolygonCoordinates[0], startPolygonCoordinates[1]);
    // 增加临时Polygon面要素坐标点
    state.polygon.updateCoordinate(`0.${state.currentVertexIndex}`, coordinates[0], coordinates[1]);
  }

  // 创建Move的临时线要素数据
  const polygonFeature = state.polygon.toGeoJSON();
  state.currentVertexIndex <= 1 && polygonFeature.geometry.coordinates[0].splice(1, 0, coordinates);

  // 计算绘制Move的临时线要素的量算
  const measure = calculatePolygonArea(this, polygonFeature.geometry.coordinates);
  // 触发执行绘制Move时的回调事件
  this.ctx.api.fire(Constants.events.DRAW_MOUSEMOVE, {
    e,
    mode: this.getMode(),
    feature: polygonFeature,
    ...measure,
  });
};

// <自定义函数>移除临时移动MoveLine要素和节点要素
PolygonMode.deleteMoveLineAndVertex = function(state) {
  const deleteFeatureIds = [];
  state.moveline && deleteFeatureIds.push(state.moveline.id);
  state.templine && deleteFeatureIds.push(state.templine.id);
  state.vertex && deleteFeatureIds.push(state.vertex.id);
  deleteFeatureIds && deleteFeatureIds.length && this.deleteFeature(deleteFeatureIds);
  state.moveline && delete state.moveline;
  state.templine && delete state.templine;
  state.vertex && delete state.vertex;
};

export default PolygonMode;
