/**
 * @文件说明: Draw.Modes.LineString 绘制“线段”模式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-29 18:12:35
 */

import assign from 'lodash/assign';
import round from 'lodash/round';
import Constants from '../constants';
import { isVertex, isEscapeKey, isEnterKey } from '../libs/common_selectors';
import isEventAtCoordinates from '../libs/is_event_at_coordinates';
import { defaultDrawSetupMethodsSetup, defaultDrawSetupMethodsStop } from './point';

const DEFAULT_CURSOR_OPTIONS = {
  cursor: 'default',
  icon: 'highlight',
  content: '单击确定起点，ESC键取消',
  clicked: '单击绘制节点，双击结束',
};

// 计算当前绘制Line线段要素的距离
export const calculateLineDistance = function(context, coordinates) {
  if (!coordinates || coordinates.length < 2) {
    return {};
  }
  const iMapApi = context.ctx.api.iMapApi;
  const { turf } = iMapApi.exports;
  const wgs84Coordinates = iMapApi.toWGS84(coordinates);
  // 计算长度距离
  const line = turf.lineString(wgs84Coordinates);
  const length = turf.length(line, { units: 'kilometers' });
  const distance = length < 1 ? length * 1000 : length;
  const measure = {
    line: {
      distance,
      round: round(distance, 2),
      unit: length < 1 ? 'm' : 'km',
      unitCN: length < 1 ? '米' : '公里',
    },
  };

  return {
    measure,
  };
};

const LineMode = {};

// Mode模式的注册 - 激活入口
LineMode.onSetup = function(options = {}) {
  // 合并绘制Line模式的光标
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
LineMode.toDisplayFeatures = function(state, geojson, display) {
  const isActiveVertexPoint = state && state.vertex && state.vertex.id === geojson.id;
  const isActiveMoveLine = state && state.moveline && state.moveline.id === geojson.id;
  const isActiveLine = state && state.line && state.line.id === geojson.id;

  // 判断是否为当前绘制<活动状态>的节点要素、Move移动线要素、Line线段要素
  if (isActiveVertexPoint || isActiveMoveLine || isActiveLine) {
    if (geojson.properties['draw:active'] === Constants.activeStates.INACTIVE) {
      isActiveVertexPoint && state.vertex.updateInternalProperty('active', Constants.activeStates.ACTIVE);
      isActiveMoveLine && state.moveline.updateInternalProperty('active', Constants.activeStates.ACTIVE);
      isActiveLine && state.line.updateInternalProperty('active', Constants.activeStates.ACTIVE);
      geojson.properties['draw:active'] = Constants.activeStates.ACTIVE;
    }
    // 判断是否绘制完成
    if (isActiveLine && state.line && state.line.completed === true) {
      // 修改当前绘制的Feature为非活动状态
      if (geojson.properties['draw:active'] === Constants.activeStates.ACTIVE) {
        geojson.properties['draw:active'] = Constants.activeStates.INACTIVE;
        state.line.updateInternalProperty('active', Constants.activeStates.INACTIVE);
      }
      display(geojson);
      this.onCompleted(geojson);
      return;
    }
  }
  display(geojson);
};

// Mode模式 - 取消释放
LineMode.onStop = function(state) {
  // 移除当前绘制<活动状态>的临时线与节点要素
  this.deleteMoveLineAndVertex(state);
  // 移除当前绘制<活动状态>无效的Line线要素
  if (state.line && state.line.coordinates.length < 2) {
    this.deleteFeature([state.line.id], { silent: true });
    delete state.line;
  }
  // 执行默认取消释放
  defaultDrawSetupMethodsStop(this);
  // 重置当前绘制Line要素的节点索引
  state.currentVertexIndex = 0;
  // 重置当前单击的时间戳
  state.clickTime = null;
};

// 触发删除选中的Feature矢量要素
LineMode.onTrash = function(state) {
  this.onCancel(state);
};

// 触发Tap/Click时的响应事件
LineMode.onTap = LineMode.onClick = function(state, e) {
  // 判断是否未构建<活动状态>的LineString要素，则进行创建
  if (!state || !state.line) {
    const line = this.newFeature({
      geometry: {
        type: Constants.geojsonTypes.LINE_STRING,
        coordinates: [],
      },
    });
    state.line = line;
    state.line.completed = false;
    this.addFeature(line);
    // 创建临时Vertex节点要素对象
    const vertex = this.newFeature({
      geometry: {
        type: Constants.geojsonTypes.MULTI_POINT,
        coordinates: [],
      },
    });
    vertex.updateInternalProperty('meta', Constants.meta.VERTEX);
    vertex.updateInternalProperty('pid', state.line.id);
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
    moveline.updateInternalProperty('pid', state.line.id);
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
  const timestamp = new Date().valueOf();
  if (
    timestamp - state.clickTime < 300 &&
    state.line &&
    state.line.coordinates.length &&
    isEventAtCoordinates(e, state.line.coordinates[state.line.coordinates.length - 1])
  ) {
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
LineMode.onMouseMove = function(state, e) {
  state.handleThrottleMouseMove && state.handleThrottleMouseMove(state, e);
};

// 触发键盘KeyUp时的响应事件
LineMode.onKeyUp = function(state, e) {
  // 判断是否输入Esc键则取消
  if (isEscapeKey(e)) {
    this.onCancel(state);
  } else if (isEnterKey(e)) {
    // 判定是否输入Enter键则完成
    this.doubleClick(state);
  }
};

// Mode模式 - 绘制完成
LineMode.onCompleted = function(geojson) {
  // 计算绘制Move的临时线要素的量算
  const measure = calculateLineDistance(this, geojson.geometry.coordinates);
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
LineMode.onCancel = function(state) {
  // 移除当前绘制<活动状态>的临时线与节点要素
  this.deleteMoveLineAndVertex(state);
  // 移除当前绘制<活动状态>的Line线要素
  if (state.line) {
    this.deleteFeature([state.line.id], { silent: true });
    delete state.line;
  }
  // 驱动事件回调
  this.ctx.api.fire(Constants.events.DRAW_CANCEL, {
    mode: this.getMode(),
  });
  // 切换到“选取”模式
  this.changeMode(Constants.modes.SELECT);
};

// <自定义函数>触发单击地图的任意地方
LineMode.clickAnywhere = function(state, e) {
  const coordinates = [e.lngLat.lng, e.lngLat.lat];
  // 更新添加Vertex节点要素坐标点
  const vertexs = state.vertex.getCoordinates();
  vertexs.push(coordinates);
  state.vertex.setCoordinates(vertexs);
  // 增加Line线段要素坐标点
  state.line.updateCoordinate(state.currentVertexIndex, coordinates[0], coordinates[1]);
  // 更新临时MoveLine线要素的起始坐标
  state.moveline.setCoordinates([coordinates]);
  // 更新当前节点的索引
  state.currentVertexIndex++;
  // 重新记录单击时间戳
  state.clickTime = new Date().valueOf();
  // 绘制要素的测量数据
  let measure = {};
  // 判定是否绘制的为起始点，则更新鼠标提示
  if (state.line.coordinates && state.line.coordinates.length === 1) {
    state.options.cursor.clicked && this.updateCursor({ content: state.options.cursor.clicked });
  } else if (state.line && state.line.coordinates.length > 1) {
    measure = calculateLineDistance(this, state.line.coordinates);
  }

  // 触发执行绘制单击时的回调事件
  this.ctx.api.fire(Constants.events.DRAW_CLICK, {
    e,
    mode: this.getMode(),
    feature: state.line.toGeoJSON(),
    ...measure,
  });
};

// <自定义函数>判定doubleClick时的响应事件
LineMode.doubleClick = function(state) {
  // 判断当前绘制<活动状态>的Line线要素坐标是否已绘制起点
  if (state.line && state.line.coordinates && state.line.coordinates.length > 1) {
    // 强制刷新Line线段要素
    this.ctx.store.featureChanged(state.line.id);
    // 当前绘制<活动状态>的临时线与节点要素
    this.deleteMoveLineAndVertex(state);
    // 更新状态
    state.line.completed = true;
  } else {
    // 绘制无效则进行清除
    this.onCancel(state);
  }
};

// <自定义函数>触发MouseMove事件的节流响应
LineMode.throttleMouseMove = function(state, e) {
  if (!state.moveline) {
    return;
  }
  const coordinates = [e.lngLat.lng, e.lngLat.lat];
  // 更新临时MoveLine线要素的截止坐标
  state.moveline.updateCoordinate(1, coordinates[0], coordinates[1]);

  // 创建Move的临时线要素数据
  const lineFeature = state.line.toGeoJSON();
  lineFeature.geometry.coordinates.push(coordinates);
  // 计算绘制Move的临时线要素的量算
  const measure = calculateLineDistance(this, lineFeature.geometry.coordinates);
  // 触发执行绘制Move时的回调事件
  this.ctx.api.fire(Constants.events.DRAW_MOUSEMOVE, {
    e,
    mode: this.getMode(),
    feature: lineFeature,
    ...measure,
  });
};

// <自定义函数>移除临时移动Line要素和节点要素
LineMode.deleteMoveLineAndVertex = function(state) {
  const deleteFeatureIds = [];
  state.moveline && deleteFeatureIds.push(state.moveline.id);
  state.vertex && deleteFeatureIds.push(state.vertex.id);
  deleteFeatureIds && deleteFeatureIds.length && this.deleteFeature(deleteFeatureIds);
  state.moveline && delete state.moveline;
  state.vertex && delete state.vertex;
};

export default LineMode;
