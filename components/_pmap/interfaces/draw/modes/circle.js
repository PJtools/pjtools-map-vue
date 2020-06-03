/**
 * @文件说明: Draw.Modes.Circle 绘制“圆形”模式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-02 14:08:45
 */

import assign from 'lodash/assign';
import round from 'lodash/round';
import Constants from '../constants';
import { isVertex } from '../libs/common_selectors';
import isEventAtCoordinates from '../libs/is_event_at_coordinates';
import PolygonMode, { calculatePolygonArea } from './polygon';
import { defaultDrawSetupMethodsSetup, defaultDrawSetupMethodsStop } from './point';
import { isEmpty, isNumeric } from '../../../../_util/methods-util';

const DEFAULT_CURSOR_OPTIONS = {
  cursor: 'default',
  icon: 'highlight',
  content: '单击确定圆心，ESC键取消',
  clicked: '再次单击，绘制结束',
};

// 计算当前绘制Circle圆形要素的面积与周长
export const calculateCircleArea = function(context, coordinates, radius) {
  let measure = {};
  // 计算Polygon的面积和周长
  const polygonMeasure = calculatePolygonArea(context, coordinates);
  if (polygonMeasure && polygonMeasure.measure) {
    measure = { ...polygonMeasure.measure };
  }
  // 追加圆形的半径
  measure.circle = {};
  measure.circle.radius = radius < 1 ? radius * 1000 : radius;
  measure.circle.round = round(measure.circle.radius, 2);
  measure.circle.unit = radius < 1 ? 'm' : 'km';
  measure.circle.unitCN = radius < 1 ? '米' : '公里';

  return {
    measure,
  };
};

const CircleMode = {};

// Mode模式的注册 - 激活入口
CircleMode.onSetup = function(options = {}) {
  // 合并绘制Circle模式的光标
  const cursorOptions = assign({}, DEFAULT_CURSOR_OPTIONS, (options && options.cursor) || {});
  options && (options.cursor = cursorOptions);
  // 执行默认初始化
  defaultDrawSetupMethodsSetup(this, options.cursor);
  // 判定是否开启设定的半径模式
  options.radius = !isEmpty(options.radius) && isNumeric(options.radius) ? Number(options.radius) : null;
  options.radius = options.radius && options.radius > 0 ? options.radius : null;

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
CircleMode.toDisplayFeatures = function(state, geojson, display) {
  const isActiveVertexPoint = state && state.vertex && state.vertex.id === geojson.id;
  const isActiveMoveLine = state && state.moveline && state.moveline.id === geojson.id;
  const isActivePolygon = state && state.polygon && state.polygon.id === geojson.id;

  // 判断是否为当前绘制<活动状态>的节点要素、Move移动线要素、Polygon面要素
  if (isActiveVertexPoint || isActiveMoveLine || isActivePolygon) {
    if (geojson.properties['draw:active'] === Constants.activeStates.INACTIVE) {
      isActiveVertexPoint && state.vertex.updateInternalProperty('active', Constants.activeStates.ACTIVE);
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
CircleMode.onStop = function(state) {
  // 移除当前绘制<活动状态>的临时线与节点要素
  this.deleteMoveLineAndVertex(state);
  // 移除当前绘制<活动状态>无效的Circle圆形要素
  if (state.polygon) {
    if (!state.polygon.coordinates || !state.polygon.coordinates.length || !state.polygon.coordinates[0].length === 1) {
      this.deleteFeature([state.polygon.id], { silent: true });
      delete state.polygon;
    }
  }
  // 执行默认取消释放
  defaultDrawSetupMethodsStop(this);
  // 重置当前单击的时间戳和单击坐标点
  state.clickTime = null;
  state.clickCoordinates = null;
};

// 触发删除选中的Feature矢量要素
CircleMode.onTrash = PolygonMode.onTrash;

// 触发Tap/Click时的响应事件
CircleMode.onTap = CircleMode.onClick = function(state, e) {
  // 判断是否未构建<活动状态>的绘制Feature要素，则进行创建
  if (!state || !state.polygon) {
    this.initStateDrawFeature(state);
    // 重置单击的时间戳和单击坐标
    state.clickTime = new Date().valueOf();
    state.clickCoordinates = [e.lngLat.lng, e.lngLat.lat];
  }

  // 设置绘图为活动状态
  this.ctx.setActive(true);

  // 判断是否进行双击判定
  if (this.isDoubleClick(state, e)) {
    // 判定是否初始时双击
    if (state.polygon.coordinates[0].length === 1) {
      this.onCancel(state);
    }
    return;
  } else {
    // 判断是否单击在绘制的节点要素上，则忽略
    if (isVertex(e)) {
      return;
    }
    // 绘制单击Click事件
    this.clickAnywhere(state, e);
  }
};

// 触发MouseMove时的响应事件
CircleMode.onMouseMove = function(state, e) {
  state.handleThrottleMouseMove && state.handleThrottleMouseMove(state, e);
};

// 触发键盘KeyUp时的响应事件
CircleMode.onKeyUp = PolygonMode.onKeyUp;

// Mode模式 - 绘制完成
CircleMode.onCompleted = function(geojson) {
  // 计算绘制Move的临时线要素的量算
  const measure = calculateCircleArea(this, geojson.geometry.coordinates, geojson.properties['draw:radius']);
  const center = geojson.properties['draw:center'].split(',');
  center && center[0] && (center[0] = Number(center[0]));
  center && center[1] && (center[1] = Number(center[1]));
  // 驱动事件回调
  this.ctx.api.fire(Constants.events.DRAW_COMPLETE, {
    mode: this.getMode(),
    feature: geojson,
    ...measure,
    center,
  });
  // 切换到“选取”模式
  this.changeMode(Constants.modes.SELECT, {
    featureIds: [geojson.id],
  });
};

// Mode模式 - 绘制取消
CircleMode.onCancel = PolygonMode.onCancel;

// <自定义函数>初始创建绘制模式的Feature对象
CircleMode.initStateDrawFeature = function(state) {
  const polygon = this.newFeature({
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [],
    },
  });
  polygon.updateInternalProperty('polygon', Constants.modes.DRAW_CIRCLE);
  state.polygon = polygon;
  state.polygon.center = null;
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
CircleMode.clickAnywhere = function(state, e) {
  const coordinates = [e.lngLat.lng, e.lngLat.lat];
  // 重新记录单击时间戳和坐标点
  state.clickTime = new Date().valueOf();
  state.clickCoordinates = coordinates;
  // 判定是否创建圆形的圆心节点
  if (!state.polygon.center) {
    // 更新添加Vertex节点要素坐标点
    const vertexs = state.vertex.getCoordinates();
    vertexs.push(coordinates);
    state.vertex.setCoordinates(vertexs);
    // 更新Circle圆要素的属性
    state.polygon.center = coordinates;
    state.polygon.updateInternalProperty('center', coordinates.join(','));
    state.polygon.updateInternalProperty('radius', 0);

    // 判定是否有设定初始半径模式，则直接绘制完成
    if (state.options.radius !== null) {
      // 根据圆心点与半径获取圆形要素坐标点
      const circle = this.getCircleByRadius(state, coordinates, state.options.radius);
      // 更新圆形要素的坐标
      const circleCoordinates = circle.coordinates;
      circleCoordinates.splice(circleCoordinates.length - 1, 1);
      state.polygon.setCoordinates([circleCoordinates]);
      state.polygon.updateInternalProperty('radius', circle.radius);
      // 结束绘制
      this.doubleClick(state);
    } else {
      // 增加Circle圆要素的坐标点
      state.polygon.updateCoordinate(`0.0`, coordinates[0], coordinates[1]);
      // 更新Circle圆的MoveLine线要素的起始坐标
      state.moveline.setCoordinates([coordinates]);
      // 更新鼠标提示
      state.options.cursor.clicked && this.updateCursor({ content: state.options.cursor.clicked });

      // 触发执行绘制单击时的回调事件
      this.ctx.api.fire(Constants.events.DRAW_CLICK, {
        e,
        mode: this.getMode(),
        feature: state.polygon.toGeoJSON(),
        center: state.polygon.center,
      });
    }
  } else {
    this.doubleClick(state);
  }
};

// <自定义函数>判定doubleClick时的响应事件
CircleMode.doubleClick = function(state) {
  // 判断当前绘制<活动状态>的Circle要素坐标是否至少3个坐标点
  if (state.polygon && state.polygon.coordinates[0] && state.polygon.coordinates[0].length > 2) {
    // 强制刷新Circle圆要素
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
CircleMode.isDoubleClick = function(state, e) {
  const timestamp = new Date().valueOf();
  if (timestamp - state.clickTime < 300 && state.polygon && state.polygon.coordinates.length) {
    const coordinates = state.polygon.coordinates[0];
    if (coordinates && isEventAtCoordinates(e, state.clickCoordinates)) {
      return true;
    }
  }
  return false;
};

// <自定义函数>触发MouseMove事件的节流响应
CircleMode.throttleMouseMove = function(state, e) {
  if (!state.moveline || !state.polygon.center) {
    return;
  }
  const coordinates = [e.lngLat.lng, e.lngLat.lat];
  // 根据两点获取绘制圆形的坐标
  const circle = this.getCircleByCoordinates(state, state.polygon.center, coordinates);
  // 更新临时移动MoveLine要素的坐标
  state.moveline.setCoordinates(circle.coordinates);
  // 更新圆形要素的坐标
  const circleCoordinates = [...circle.coordinates];
  circleCoordinates.splice(circleCoordinates.length - 1, 1);
  state.polygon.setCoordinates([circleCoordinates]);
  state.polygon.updateInternalProperty('radius', circle.radius);

  // 计算绘制Move的临时Circle要素的量算
  const polygonFeature = state.polygon.toGeoJSON();
  const measure = calculateCircleArea(this, polygonFeature.geometry.coordinates, circle.radius);
  // 触发执行绘制Move时的回调事件
  this.ctx.api.fire(Constants.events.DRAW_MOUSEMOVE, {
    e,
    mode: this.getMode(),
    feature: polygonFeature,
    center: state.polygon.center,
    ...measure,
  });
};

// <自定义函数>根据起始点与半径坐标点，获取绘制Circle圆形要素坐标点
CircleMode.getCircleByCoordinates = function(state, center, coordinates) {
  // 计算两点之间的距离，即圆形半径
  const iMapApi = this.ctx.api.iMapApi;
  const { turf } = iMapApi.exports;
  const wgs84Center = iMapApi.toWGS84(center);
  const wgs84Coordinates = iMapApi.toWGS84(coordinates);
  const line = turf.lineString([wgs84Center, wgs84Coordinates]);
  const radius = turf.length(line, { units: 'kilometers' });
  // 根据中心点和半径生成圆形要素坐标
  const circleFeature = iMapApi.createCircleFeature(state.polygon.id, center, radius);
  return {
    coordinates: circleFeature.geometry.coordinates[0],
    radius,
  };
};

// <自定义函数>根据起始点与半径数值，获取绘制Circle圆形要素坐标点
CircleMode.getCircleByRadius = function(state, center, radius) {
  const iMapApi = this.ctx.api.iMapApi;
  const circleFeature = iMapApi.createCircleFeature(state.polygon.id, center, radius);
  return {
    coordinates: circleFeature.geometry.coordinates[0],
    radius,
  };
};

// <自定义函数>移除临时移动MoveLine要素和节点要素
CircleMode.deleteMoveLineAndVertex = function(state) {
  const deleteFeatureIds = [];
  state.moveline && deleteFeatureIds.push(state.moveline.id);
  state.vertex && deleteFeatureIds.push(state.vertex.id);
  deleteFeatureIds && deleteFeatureIds.length && this.deleteFeature(deleteFeatureIds);
  state.moveline && delete state.moveline;
  state.vertex && delete state.vertex;
};

export default CircleMode;
