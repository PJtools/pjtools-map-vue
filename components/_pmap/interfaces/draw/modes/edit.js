/**
 * @文件说明: Draw.Modes.Edit 绘制“编辑”模式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-04 17:58:05
 */

import findIndex from 'lodash/findIndex';
import Constants from '../constants';
import SelectMode from './select';
import { createSupplementaryPoints } from '../libs/create_supplementary_points';
import { noTarget, isFeature, isVertex, isActiveFeature, isMidPoint, isShiftDown } from '../libs/common_selectors';
import moveFeatures from '../libs/move_features';

const EditMode = {};

// Mode模式的注册 - 激活入口
EditMode.onSetup = function(options = {}) {
  const state = {
    options,
    // 地图双击交互对象
    doubleClickZoom: this.ctx.iMapApi.Handlers.doubleClickZoom,
    // 地图漫游交互对象
    dragPan: this.ctx.iMapApi.Handlers.dragPan,
    // 当前选中的要素信息
    selectedFeatures: {},
    // 当前选中的节点路径
    selectedCoordPaths: [],
    // 拖拽时移动的坐标
    dragMoveLocation: null,
    // 是否拖拽操作
    dragMoving: false,
    // 拖拽对象类型
    dragMeta: null,
    // 是否允许拖拽
    canDragMove: false,
  };

  const initiallySelectedFeatureIds = options.featureIds || [];
  // 获取初始待选中的要素Id
  const selectedFeatureIds = initiallySelectedFeatureIds.filter(id => {
    const feature = this.getFeature(id);
    return feature !== undefined && feature !== null && feature.properties['draw:meta'] === Constants.meta.FEATURE;
  });
  // 设置当前选中状态的要素
  if (selectedFeatureIds && selectedFeatureIds.length) {
    state.selectedFeatures = this.setSelectedFeatureByIds(selectedFeatureIds, { midpoint: true, selectedPaths: state.selectedCoordPaths });
  }
  // 清空选中的Vertex节点
  this.setSelectedCoordinates(state.selectedCoordPaths);
  // 设置当前可活动操作的状态
  this.fireActionable();

  return state;
};

// 触发已绘制的所有Feature矢量要素对象进行显示渲染
EditMode.toDisplayFeatures = SelectMode.toDisplayFeatures;

// Mode模式 - 取消释放
EditMode.onStop = function(state) {
  // 清除选中的要素节点和选中状态
  this.removeSelectedFeaturesVertex(state);
  // 清空选中的Vertex节点
  this.clearSelectedCoordinatePaths(state);
  // 清除拖拽的状态
  this.stopDragging(state);
  // 延时恢复还原地图双击缩放交互，避免绘制状态结束的双击触发
  window.setTimeout(() => {
    this.ctx.iMapApi.Handlers.doubleClickZoom.enable();
  }, 300);
};

// 触发删除选中的Feature矢量要素
EditMode.onTrash = function(state) {
  const selectedFeatureIds = this.getSelectedIds();
  if (selectedFeatureIds && selectedFeatureIds.length) {
    // 移除选中的选中状态与节点
    this.removeSelectedFeaturesVertex(state);
    // 移除选中的Feature要素
    this.deleteFeature(selectedFeatureIds);
    // 强制刷新数据
    this.ctx.store.setModeChangeRendering();
  }
};

// 触发Tap/Click时的响应事件
EditMode.onTap = EditMode.onClick = function(state, e) {
  // 判断是否未选中任何要素对象
  if (noTarget(e)) {
    this.clearSelectedCoordinatePaths(state);
    this.removeSelectedFeaturesVertex(state);
  } else if (isFeature(e)) {
    this.clearSelectedCoordinatePaths(state);
    // 判断是否单击Feature要素
    this.clickOnFeature(state, e);
  }
  this.stopDragging(state);
};

// 触发MouseMove时的响应事件
EditMode.onMouseMove = function(state, e) {
  const featureId = e.featureTarget && e.featureTarget.id;
  const properties = e.featureTarget && e.featureTarget.properties;
  if (featureId) {
    state.doubleClickZoom.disable();
    // 判断是否为选中的Feature要素
    if (isFeature(e) && this.isSelected(featureId)) {
      // 判断是否没有激活的选中Vertex节点, 反之则禁止拖拽鼠标样式
      if (!state.selectedCoordPaths.length) {
        this.setMapCursorStyle('move');
      } else {
        this.setMapCursorStyle();
      }
    } else if (
      isVertex(e) &&
      (findIndex(state.selectedCoordPaths, {
        feature_id: properties['draw:pid'],
        coord_path: properties['draw:path'],
      }) !== -1 ||
        (properties && properties['draw:polygon'] && ['circle', 'ellipse', 'rectangle', 'square'].indexOf(properties['draw:polygon']) !== -1))
    ) {
      // 判断是否为选中的Vertex节点对象或者是否为特殊图形的节点
      this.setMapCursorStyle('move');
    } else {
      this.setMapCursorStyle('pointer');
    }
  } else {
    this.setMapCursorStyle();
    state.doubleClickZoom.enable();
  }
  this.stopDragging(state);

  return true;
};

// 触发MouseDown/TouchStart时的响应事件
EditMode.onTouchStart = EditMode.onMouseDown = function(state, e) {
  // 判断是否选择类型为Vertex节点
  if (isVertex(e)) {
    return this.downOnVertex(state, e);
  } else if (isMidPoint(e)) {
    // 判断是否选择类型为MidPoint中点
    return this.downOnMidPoint(state, e);
  } else if (isActiveFeature(e)) {
    // 判断是否选择类型为激活的Feature要素
    return this.downOnFeature(state, e);
  }
};

// 触发Drag时的响应事件
EditMode.onDrag = function(state, e) {
  if (state.canDragMove !== true) {
    return;
  }
  state.dragMoving = true;
  e.originalEvent.stopPropagation();

  // 记录当前拖拽的相对偏移坐标
  const delta = {
    lng: e.lngLat.lng - state.dragMoveLocation.lng,
    lat: e.lngLat.lat - state.dragMoveLocation.lat,
  };

  // 判断是否有选中的坐标点, 则拖拽Vertex节点, 反之则拖拽Feature要素
  if (state.selectedCoordPaths.length > 0) {
    state.dragMeta = Constants.meta.VERTEX;
    this.dragVertex(state, e, delta);
  } else {
    state.dragMeta = Constants.meta.FEATURE;
    this.dragFeature(state, e, delta);
  }

  state.dragMoveLocation = e.lngLat;
};

// 触发MoveOut时的响应事件
EditMode.onMouseOut = function(state) {
  if (state.dragMoving) {
    this.fireUpdate(state);
  }
  return true;
};

// 触发MouseUp/TouchEnd时的响应事件
EditMode.onTouchEnd = EditMode.onMouseUp = function(state, e) {
  if (state.dragMoving) {
    this.fireUpdate(state);
  }
  this.stopDragging(state);
};

// <自定义函数>单击绘制的Feature要素
EditMode.clickOnFeature = function(state, e) {
  // 获取当前选取的Feature要素
  const featureId = e.featureTarget.id;
  // 是否同时按下组合Shift键
  const isShiftClick = isShiftDown(e);
  // 判定是否已经是选中状态
  const isFeatureSelected = this.isSelected(featureId);

  // 判断是否为Shift键组合单击, 则进行多选
  if (isShiftClick) {
    if (!isFeatureSelected) {
      this.addMultiSelectedFeature(state, e.featureTarget);
    } else {
      this.removeMultiSelectedFeature(state, e.featureTarget);
    }
  } else {
    this.setSingleActiveFeatureById(state, featureId);
    // 更新当前可活动操作的状态
    this.fireActionable();
  }
};

// <自定义函数>敲击按下绘制的Vertex节点
EditMode.downOnVertex = function(state, e) {
  this.startDragging(state, e);
  const properties = e.featureTarget.properties;
  const featureId = properties['draw:pid'];
  const vertexPath = properties['draw:path'];

  const refreshSelectVertex = () => {
    // 设置单个Feature要素选中
    this.setSingleActiveFeatureById(state, featureId);
    // 更新选中节点记录
    this.setSelectedCoordinates(state.selectedCoordPaths);
    // 刷新当前可活动操作的状态
    this.fireActionable();
  };

  // 判断当前选中的要素是否为多个
  if (Object.keys(state.selectedFeatures).length > 1) {
    state.selectedCoordPaths = [this.pathToCoordinates(featureId, vertexPath)];
    refreshSelectVertex();
  } else {
    const selectedIndex = findIndex(state.selectedCoordPaths, { feature_id: featureId, coord_path: vertexPath });
    // 判断当前节点是否为未选中节点
    if (selectedIndex === -1) {
      // 判断是否为Shift多选组合键
      if (isShiftDown(e)) {
        state.selectedCoordPaths.push(this.pathToCoordinates(featureId, vertexPath));
      } else {
        state.selectedCoordPaths = [this.pathToCoordinates(featureId, vertexPath)];
      }
      refreshSelectVertex();
    } else if (isShiftDown(e) && selectedIndex !== -1) {
      state.selectedCoordPaths.splice(selectedIndex, 1);
      refreshSelectVertex();
    }
  }
};

// <自定义函数>敲击按下绘制的MidPoint中点
EditMode.downOnMidPoint = function(state, e) {};

// <自定义函数>敲击按下绘制的Feature要素
EditMode.downOnFeature = function(state, e) {
  // 判断是否未激活选中节点,则开始执行拖拽Feature要素
  if (state.selectedCoordPaths.length === 0) {
    this.startDragging(state, e);
  } else {
    this.stopDragging(state);
  }
};

// <自定义函数>启动拖拽交互操作
EditMode.startDragging = function(state, e) {
  state.dragPan.disable();
  state.canDragMove = true;
  state.dragMoveLocation = e.lngLat;
  // 设置绘图为非活动状态
  this.ctx.setActive(true);
};

// <自定义函数>停止拖拽交互操作
EditMode.stopDragging = function(state) {
  state.dragPan.enable({ silent: true });
  state.dragMoving = false;
  state.dragMeta = null;
  state.canDragMove = false;
  state.dragMoveLocation = null;
  // 设置绘图为非活动状态
  this.ctx.setActive(false);
};

// <自定义函数>拖拽选中的Vertex节点
EditMode.dragVertex = function(state, e, delta) {};

// <自定义函数>拖拽选中的Feature要素
EditMode.dragFeature = function(state, e, delta) {
  const selectedFeatures = [];
  // 获取所有选中Feauture要素与节点对象
  const selectedFeature = this.getSelected();
  selectedFeature.map(feature => {
    selectedFeatures.push(feature);
    // 查找对应的节点对象
    const points = state.selectedFeatures[feature.id] && state.selectedFeatures[feature.id].features;
    points && points.length && selectedFeatures.push(...points);
  });
  // 移动相对位置
  moveFeatures(selectedFeatures, delta);
  state.dragMoveLocation = e.lngLat;
  // 执行事件回调
  this.ctx.api.fire(Constants.events.DRAW_DRAG, {
    action: state.dragMeta,
    features: selectedFeatures.filter(feature => feature.properties['draw:meta'] === Constants.meta.FEATURE).map(feature => feature.toGeoJSON()),
  });
};

// <自定义函数>转换坐标点关联Feature要素Id
EditMode.pathToCoordinates = function(featureId, path) {
  return { feature_id: featureId, coord_path: path };
};

// <自定义函数>多选指定Id的Feature要素
EditMode.addMultiSelectedFeature = function(state, feature) {
  const selectedFeatures = this.getSelected();
  let isMultiSelected = true;
  // 判断当前待添加多选的要素是否与现有选中要素类型不同
  for (let i = 0, len = selectedFeatures.length; i < len; i++) {
    const featureType = selectedFeatures[i].type.replace('Multi', '');
    if (feature.geometry.type.replace('Multi', '') !== featureType) {
      isMultiSelected = false;
      break;
    }
  }
  // 判断是否允许多选添加
  if (isMultiSelected) {
    this.addMultiActiveFeatureById(state, feature.id);
  } else {
    this.setSingleActiveFeatureById(state, feature.id);
  }
  // 更新当前可活动操作的状态
  this.fireActionable();
};

// <自定义函数>移除指定Id的Feature要素的多选状态
EditMode.removeMultiSelectedFeature = function(state, feature) {
  // 删除指定Id的要素选中状态
  this.deleteSelectedFeature(state, feature.id);
  // 判断现有选中是否只有1个, 则重新渲染
  const selectedFeatureIds = Object.keys(state.selectedFeatures);
  if (selectedFeatureIds.length === 1) {
    this.setSingleActiveFeatureById(state, selectedFeatureIds[0]);
  }
  // 更新当前可活动操作的状态
  this.fireActionable();
};

// <自定义函数>单击激活选中的Feature要素上的Vertex节点对象
EditMode.clickOnVertex = function(state, e) {};

// <自定义函数>单击激活选中的Feature要素上的MidPoint中点对象
EditMode.clickOnMidPoint = function(state, e) {};

// <自定义函数>驱动编辑要素的更新事件
EditMode.fireUpdate = function(state) {
  const action = state.dragMeta === Constants.meta.FEATURE ? 'move' : 'change_coordinates';
  const features = this.getSelected().map(f => f.toGeoJSON());
  // 执行事件回调
  this.ctx.api.fire(Constants.events.UPDATE, {
    action,
    features,
  });
};

// <自定义函数>根据选取要素驱动更新可活动操作的状态
EditMode.fireActionable = function(state, e) {
  const selectedFeatures = this.getSelected();
  // 判断是否为复合Feature要素面
  const multiFeatures = selectedFeatures.filter(feature => this.isInstanceOf('MultiFeature', feature));

  let combineFeatures = false;
  // 判断是否有多个选中，且要素类型相同
  if (selectedFeatures.length > 1) {
    combineFeatures = true;
    const featureType = selectedFeatures[0].type.replace('Multi', '');
    selectedFeatures.forEach(feature => {
      if (feature.type.replace('Multi', '') !== featureType) {
        combineFeatures = false;
      }
    });
  }

  const uncombineFeatures = multiFeatures.length > 0;
  const trash = selectedFeatures.length > 0;

  this.setActionableState({
    combineFeatures,
    uncombineFeatures,
    trash,
  });
};

// <自定义函数>清空选中的要素节点
EditMode.clearSelectedCoordinatePaths = function(state) {
  if (state.selectedCoordPaths && state.selectedCoordPaths.length) {
    this.setSelectedCoordinates([]);
    state.selectedCoordPaths = [];
  }
};

// <自定义函数>单个选中指定Id的Feature要素
EditMode.setSingleActiveFeatureById = function(state, featureId) {
  // 移除当前所有选中的要素
  this.removeSelectedFeaturesVertex(state);
  // 重新选中指定Id要素
  state.selectedFeatures = this.setSelectedFeatureByIds([featureId], { midpoint: true, selectedPaths: state.selectedCoordPaths });
};

// <自定义函数>添加指定Id的Feature要素进行多选队列
EditMode.addMultiActiveFeatureById = function(state, featureId) {
  const currentSelectedIds = Object.keys(state.selectedFeatures);
  // 移除当前所有选中的要素
  this.removeSelectedFeaturesVertex(state);
  // 重新选中指定Id要素
  state.selectedFeatures = this.setSelectedFeatureByIds([...currentSelectedIds, featureId], {
    midpoint: false,
    selectedPaths: state.selectedCoordPaths,
  });
};

// <自定义函数>删除选中指定Id的Feature要素
EditMode.deleteSelectedFeature = function(state, featureId) {
  // 删除指定Id的节点对象
  const deleteVertexIds = [];
  if (state.selectedFeatures[featureId]) {
    state.selectedFeatures[featureId].features.map(vertex => {
      deleteVertexIds.push(vertex.id);
    });
    delete state.selectedFeatures[featureId];
  }
  deleteVertexIds && deleteVertexIds.length && this.deleteFeature(deleteVertexIds, { silent: true });
  // 删除选中状态
  this.deselect(featureId);
};

// <自定义函数>根据选中要素Id创建对应要素的节点
EditMode.setSelectedFeatureByIds = function(selectedIds, options = {}) {
  const selectedFeatureIds = selectedIds && selectedIds.length ? selectedIds : [];
  // 修改选中Feature要素的Id
  this.setSelected(selectedFeatureIds);

  const selectedFeatures = {};
  // 根据当前选中的要素创建要素线段的节点
  selectedFeatureIds.map(id => {
    const feature = this.getFeature(id);
    // 判断是否为无中点类型的Polygon面要素
    const isNotMidPointPolygon =
      feature.type === Constants.geojsonTypes.POINT ||
      (feature.type === Constants.geojsonTypes.POLYGON &&
        ['circle', 'ellipse', 'rectangle', 'square'].indexOf(feature.properties['draw:polygon']) !== -1);
    options.midpoint = isNotMidPointPolygon ? false : !!options.midpoint;
    // 构建对应选中要素的节点或中点
    const vertexs = createSupplementaryPoints(this, feature, options);
    vertexs.map(point => this.addFeature(point));
    selectedFeatures[id] = {
      midpoint: options.midpoint,
      features: vertexs,
    };
  });
  return selectedFeatures;
};

// <自定义函数>移除选中要素状态及节点
EditMode.removeSelectedFeaturesVertex = function(state) {
  const selectedFeatureIds = Object.keys(state.selectedFeatures);
  // 删除所有选中的要素的节点对象
  const deleteVertexIds = [];
  if (selectedFeatureIds && selectedFeatureIds.length) {
    selectedFeatureIds.map(id => {
      state.selectedFeatures[id].features.map(vertex => {
        deleteVertexIds.push(vertex.id);
      });
      delete state.selectedFeatures[id];
    });
  }
  deleteVertexIds && deleteVertexIds.length && this.deleteFeature(deleteVertexIds, { silent: true });
  // 清除选中要素的队列
  this.clearSelectedFeatures();
};

export default EditMode;
