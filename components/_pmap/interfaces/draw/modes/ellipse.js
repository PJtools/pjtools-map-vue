/**
 * @文件说明: Draw.Modes.Ellipse 绘制“椭圆”模式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-03 11:58:29
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
  content: '单击确定圆心，ESC键取消',
  clicked: '再次单击，绘制结束',
};

// 计算当前绘制Ellipse椭圆要素的面积与周长
export const calculateEllipseArea = function(context, coordinates, xradius, yradius) {
  let measure = {};
  // 计算Polygon的面积和周长
  const polygonMeasure = calculatePolygonArea(context, coordinates);
  if (polygonMeasure && polygonMeasure.measure) {
    measure = { ...polygonMeasure.measure };
  }
  // 追加椭圆的长轴半径
  measure.xradius = {};
  measure.xradius.radius = xradius < 1 ? xradius * 1000 : xradius;
  measure.xradius.round = round(measure.xradius.radius, 2);
  measure.xradius.unit = xradius < 1 ? 'm' : 'km';
  measure.xradius.unitCN = xradius < 1 ? '米' : '公里';
  // 追加椭圆的短轴半径
  measure.yradius = {};
  measure.yradius.radius = yradius < 1 ? yradius * 1000 : yradius;
  measure.yradius.round = round(measure.yradius.radius, 2);
  measure.yradius.unit = yradius < 1 ? 'm' : 'km';
  measure.yradius.unitCN = yradius < 1 ? '米' : '公里';

  return {
    measure,
  };
};

const EllipseMode = {};

// Mode模式的注册 - 激活入口
EllipseMode.onSetup = function(options = {}) {
  // 合并绘制Ellipse模式的光标
  const cursorOptions = assign({}, DEFAULT_CURSOR_OPTIONS, (options && options.cursor) || {});
  options && (options.cursor = cursorOptions);
  // 执行默认初始化
  defaultDrawSetupMethodsSetup(this, options.cursor);
  // 判定是否开启设定的长轴半径模式
  options.radius = !isEmpty(options.radius) && isNumeric(options.radius) ? Number(options.radius) : null;
  options.radius = options.radius && options.radius > 0 ? options.radius : null;
  // 设置椭圆的偏心率（0：表示椭圆短轴越长；1：表示椭圆短轴越短）
  options.eccentricity = !isEmpty(options.eccentricity) && isNumeric(options.eccentricity) ? Number(options.eccentricity) : 0.8;
  options.eccentricity = options.eccentricity < 0 ? 0 : options.eccentricity >= 1 ? 0.99 : options.eccentricity;

  let renderRequest;
  return {
    options,
    // 椭圆节点数
    divisions: 99,
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
EllipseMode.toDisplayFeatures = CircleMode.toDisplayFeatures;

// Mode模式 - 取消释放
EllipseMode.onStop = CircleMode.onStop;

// 触发删除选中的Feature矢量要素
EllipseMode.onTrash = CircleMode.onTrash;

// 触发Tap/Click时的响应事件
EllipseMode.onTap = EllipseMode.onClick = CircleMode.onClick;

// 触发MouseMove时的响应事件
EllipseMode.onMouseMove = function(state, e) {
  state.handleThrottleMouseMove && state.handleThrottleMouseMove(state, e);
};

// 触发键盘KeyUp时的响应事件
EllipseMode.onKeyUp = CircleMode.onKeyUp;

// Mode模式 - 绘制完成
EllipseMode.onCompleted = function(geojson) {
  // 计算绘制Ellipse椭圆要素的量算
  const measure = calculateEllipseArea(this, geojson.geometry.coordinates, geojson.properties['draw:xradius'], geojson.properties['draw:yradius']);
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
EllipseMode.onCancel = CircleMode.onCancel;

// <自定义函数>初始创建绘制模式的Feature对象
EllipseMode.initStateDrawFeature = function(state) {
  const polygon = this.newFeature({
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [],
    },
  });
  polygon.updateInternalProperty('polygon', Constants.modes.DRAW_ELLIPSE);
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
EllipseMode.clickAnywhere = function(state, e) {
  const coordinates = [e.lngLat.lng, e.lngLat.lat];
  // 重新记录单击时间戳和坐标点
  state.clickTime = new Date().valueOf();
  state.clickCoordinates = coordinates;
  // 判定是否创建椭圆的圆心节点
  if (!state.polygon.center) {
    // 更新添加Vertex节点要素坐标点
    const vertexs = state.vertex.getCoordinates();
    vertexs.push(coordinates);
    state.vertex.setCoordinates(vertexs);
    // 更新Ellipse椭圆要素的属性
    state.polygon.center = coordinates;
    state.polygon.updateInternalProperty('center', coordinates.join(','));
    state.polygon.updateInternalProperty('xradius', 0);
    state.polygon.updateInternalProperty('yradius', 0);

    // 判定是否有设定初始长轴半径模式，则直接绘制完成
    if (state.options.radius !== null) {
      // 根据起点与长轴半径获取要素坐标点
      const ellipse = this.getEllipseByRadius(state, coordinates, state.options.radius);
      // 更新Ellipse椭圆要素的坐标
      const ellipseCoordinates = [...ellipse.coordinates];
      ellipseCoordinates.splice(ellipseCoordinates.length - 1, 1);
      state.polygon.setCoordinates([ellipseCoordinates]);
      state.polygon.updateInternalProperty('xradius', ellipse.xradius);
      state.polygon.updateInternalProperty('yradius', ellipse.yradius);
      // 结束绘制
      this.doubleClick(state);
    } else {
      // 增加Ellipse椭圆要素的坐标点
      state.polygon.updateCoordinate(`0.0`, coordinates[0], coordinates[1]);
      // 更新Ellipse椭圆的MoveLine线要素的起始坐标
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
EllipseMode.doubleClick = CircleMode.doubleClick;

// <自定义函数>判定是否为DoubleClick双击事件
EllipseMode.isDoubleClick = CircleMode.isDoubleClick;

// <自定义函数>触发MouseMove事件的节流响应
EllipseMode.throttleMouseMove = function(state, e) {
  if (!state.moveline || !state.polygon.center) {
    return;
  }

  const coordinates = [e.lngLat.lng, e.lngLat.lat];
  // 根据两点获取绘制椭圆的坐标
  const ellipse = this.getEllipseByCoordinates(state, state.polygon.center, coordinates);
  // 更新临时移动MoveLine要素的坐标
  state.moveline.setCoordinates(ellipse.coordinates);
  // 更新Ellipse椭圆要素的坐标
  const ellipseCoordinates = [...ellipse.coordinates];
  ellipseCoordinates.splice(ellipseCoordinates.length - 1, 1);
  state.polygon.setCoordinates([ellipseCoordinates]);
  state.polygon.updateInternalProperty('xradius', ellipse.xradius);
  state.polygon.updateInternalProperty('yradius', ellipse.yradius);
  // 计算绘制Move的临时Ellipse椭圆要素的量算
  const polygonFeature = state.polygon.toGeoJSON();
  const measure = calculateEllipseArea(this, polygonFeature.geometry.coordinates, ellipse.xradius, ellipse.yradius);
  // 触发执行绘制Move时的回调事件
  this.ctx.api.fire(Constants.events.DRAW_MOUSEMOVE, {
    e,
    mode: this.getMode(),
    feature: polygonFeature,
    ...measure,
  });
};

// <自定义函数>移除临时移动MoveLine要素和节点要素
EllipseMode.deleteMoveLineAndVertex = CircleMode.deleteMoveLineAndVertex;

// <自定义函数>根据起始点与长轴半径点坐标获取椭圆要素坐标
EllipseMode.getEllipseByCoordinates = function(state, center, coordinates) {
  const iMapApi = this.ctx.api.iMapApi;
  const { turf } = iMapApi.exports;
  // 计算长轴距离
  const wgs84Center = iMapApi.toWGS84(center);
  const wgs84Coordinates = iMapApi.toWGS84(coordinates);
  const xradius = Math.sqrt((wgs84Coordinates[0] - wgs84Center[0]) ** 2 + (wgs84Coordinates[1] - wgs84Center[1]) ** 2);
  // 转换短轴半径
  const yradius = xradius * Math.sqrt(1 - state.options.eccentricity ** 2);
  // 计算弧度
  const radian = Math.atan2(wgs84Coordinates[1] - wgs84Center[1], wgs84Coordinates[0] - wgs84Center[0]);
  // 生成椭圆的坐标点
  let startCoordinates = [];
  const ellipseCoordinates = [];
  for (let i = 0; i < state.divisions; i++) {
    const angle = (i / state.divisions) * (Math.PI * 2);
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    const tx = xradius * Math.cos(angle);
    const ty = yradius * Math.sin(angle);
    // 围绕椭圆中心旋转点。
    const x = tx * cos - ty * sin + wgs84Center[0];
    const y = tx * sin + ty * cos + wgs84Center[1];
    i === 0 && (startCoordinates = [x, y]);
    ellipseCoordinates.push(iMapApi.fromWGS84([x, y]));
  }
  ellipseCoordinates.push(ellipseCoordinates[0]);
  // 计算长轴距离
  const radius = turf.length(turf.lineString([wgs84Center, startCoordinates]), { units: 'kilometers' });

  return {
    coordinates: ellipseCoordinates,
    xradius: radius,
    yradius: radius * Math.sqrt(1 - state.options.eccentricity ** 2),
  };
};

// <自定义函数>根据起始点与长轴半径获取椭圆要素坐标
EllipseMode.getEllipseByRadius = function(state, center, radius) {
  const iMapApi = this.ctx.api.iMapApi;
  const { turf } = iMapApi.exports;
  // 获取长轴半径点
  const feature = turf.destination(iMapApi.toWGS84(center), radius, 0, { units: 'kilometers' });
  const coordinates = iMapApi.fromWGS84(turf.getCoord(feature));
  // 获取椭圆的坐标点
  const ellipse = this.getEllipseByCoordinates(state, center, coordinates);

  return {
    coordinates: ellipse.coordinates,
    xradius: radius,
    yradius: radius * Math.sqrt(1 - state.options.eccentricity ** 2),
  };
};

export default EllipseMode;
