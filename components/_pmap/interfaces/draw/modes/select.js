/**
 * @文件说明: Draw.Modes.Select 绘制“选取”模式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-28 17:15:30
 */

import Constants from '../constants';
import { createSupplementaryMultiPoints } from '../libs/create_supplementary_points';
import { noTarget, isFeature, isVertex, isShiftDown } from '../libs/common_selectors';
import { isBooleanFlase } from '../../../../_util/methods-util';

const SelectMode = {};

// Mode模式的注册 - 激活入口
SelectMode.onSetup = function(options = {}) {
  const state = {
    options,
    // 地图双击交互对象
    doubleClickZoom: this.ctx.iMapApi.Handlers.doubleClickZoom,
    // 当前选中的要素信息
    selectedFeatures: {},
    // 是否允许执行Delete删除选中要素功能
    trash: isBooleanFlase(options.trash) ? false : true,
    // 是否允许切换选择Feature要素功能
    select: isBooleanFlase(options.select) ? false : true,
    // 是否允许自动进入编辑模式
    edit: isBooleanFlase(options.edit) ? false : true,
  };

  const initiallySelectedFeatureIds = options.featureIds || [];
  // 获取初始待选中的要素Id
  const selectedFeatureIds = initiallySelectedFeatureIds.filter(id => {
    const feature = this.getFeature(id);
    return feature !== undefined && feature !== null && feature.properties['draw:meta'] === Constants.meta.FEATURE;
  });
  // 设置当前选中状态的要素
  state.selectedFeatures = this.setSelectedFeatureByIds(selectedFeatureIds);
  // 设置当前可活动操作的状态
  this.setActionableState({
    trash: state.trash,
  });

  return state;
};

// 触发已绘制的所有Feature矢量要素对象进行显示渲染
SelectMode.toDisplayFeatures = function(state, geojson, display) {
  // 判断当前要素或节点是否为选中状态
  const isFeatureMeta = geojson.properties['draw:meta'] === Constants.meta.FEATURE;
  const isSelected = isFeatureMeta ? this.isSelected(geojson.id) : this.isSelected(geojson.properties['draw:pid']);
  // 调整当前渲染的活动状态
  geojson.properties['draw:active'] = isSelected ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
  // 渲染更新的Feature要素
  display(geojson);
};

// Mode模式 - 取消释放
SelectMode.onStop = function(state) {
  // 清除选中的要素节点和选中状态
  this.removeSelectedFeaturesVertex(state);
  // 延时恢复还原地图双击缩放交互，避免绘制状态结束的双击触发
  window.setTimeout(() => {
    this.ctx.iMapApi.Handlers.doubleClickZoom.enable();
  }, 300);
};

// 触发删除选中的Feature矢量要素
SelectMode.onTrash = function(state) {
  if (state.trash) {
    const selectedFeatureIds = this.getSelectedIds();
    if (selectedFeatureIds && selectedFeatureIds.length) {
      // 移除选中的选中状态与节点
      this.removeSelectedFeaturesVertex(state);
      // 移除选中的Feature要素
      this.deleteFeature(selectedFeatureIds);
      // 强制刷新数据
      this.ctx.store.setModeChangeRendering();
    }
  }
};

// 触发Tap/Click时的响应事件
SelectMode.onTap = SelectMode.onClick = function(state, e) {
  if (state.select) {
    // 判定是否单击Feature要素或Vertex节点要素
    if (isFeature(e) || isVertex(e)) {
      this.clickOnFeature(state, e);
    } else if (noTarget(e)) {
      // 未选中任何Feature要素则清除所有选中要素
      this.removeSelectedFeaturesVertex(state);
    }
  }
};

// 触发MouseMove时的响应事件
SelectMode.onMouseMove = function(state, e) {
  const featureId = e.featureTarget && e.featureTarget.id;
  if (featureId) {
    state.doubleClickZoom.disable();
    this.setMapCursorStyle('pointer');
  } else {
    this.setMapCursorStyle();
    state.doubleClickZoom.enable();
  }
  return true;
};

// <自定义函数>单击绘制的Feature要素
SelectMode.clickOnFeature = function(state, e) {
  // 获取当前选取的Feature要素
  const featureId = isVertex(e) ? e.featureTarget.properties['draw:pid'] : e.featureTarget.id;
  // 是否同时按下组合Shift键
  const isShiftClick = isShiftDown(e);
  // 判定是否已经是选中状态
  const isFeatureSelected = this.isSelected(featureId);

  // 判定是否为普通单击且已选中状态，则进入编辑模式
  if (!isShiftClick && isFeatureSelected && state.edit) {
    return this.changeMode(Constants.modes.EDIT, {
      featureIds: [featureId],
    });
  }
  // 判定是否Shift+已选中状态，则取消选中
  if (isShiftClick && isFeatureSelected) {
    this.deleteSelectedFeature(state, featureId);
  } else if (!isFeatureSelected) {
    // 判定是否未选中状态，则单选选中
    this.removeSelectedFeaturesVertex(state);
    // 选中指定要素Id
    state.selectedFeatures = this.setSelectedFeatureByIds([featureId]);
  }
};

// <自定义函数>判断是否为活动状态的Feature要素
SelectMode.isSelectedActiveFeature = function(geojson) {
  if (geojson.properties['draw:meta'] === Constants.meta.FEATURE && geojson.properties['draw:active'] === Constants.activeStates.ACTIVE) {
    // 判断是否为非Point要素对象
    if (geojson.geometry.type !== Constants.geojsonTypes.POINT) {
      return true;
    }
  }
  return false;
};

// <自定义函数>根据选中要素Id创建对应要素的节点
SelectMode.setSelectedFeatureByIds = function(selectedIds) {
  const selectedFeatureIds = selectedIds && selectedIds.length ? selectedIds : [];
  // 修改选中Feature要素的Id
  this.setSelected(selectedFeatureIds);

  const selectedFeatures = {};
  // 根据当前选中的要素创建要素线段的节点
  selectedFeatureIds.map(id => {
    const feature = this.getFeature(id);
    const vertexs = createSupplementaryMultiPoints(this, feature);
    vertexs.map(point => this.addFeature(point));
    selectedFeatures[id] = vertexs;
  });
  return selectedFeatures;
};

// <自定义函数>删除指定Id的选中要素
SelectMode.deleteSelectedFeature = function(state, id) {
  // 删除指定Id的节点对象
  const deleteVertexIds = [];
  if (state.selectedFeatures[id]) {
    state.selectedFeatures[id].map(vertex => {
      deleteVertexIds.push(vertex.id);
    });
    delete state.selectedFeatures[id];
  }
  deleteVertexIds && deleteVertexIds.length && this.deleteFeature(deleteVertexIds, { silent: true });
  // 删除选中状态
  this.deselect(id);
};

// <自定义函数>移除选中要素状态及节点
SelectMode.removeSelectedFeaturesVertex = function(state) {
  const selectedFeatureIds = Object.keys(state.selectedFeatures);
  // 删除所有选中的要素的节点对象
  const deleteVertexIds = [];
  if (selectedFeatureIds && selectedFeatureIds.length) {
    selectedFeatureIds.map(id => {
      state.selectedFeatures[id].map(vertex => {
        deleteVertexIds.push(vertex.id);
      });
      delete state.selectedFeatures[id];
    });
  }
  deleteVertexIds && deleteVertexIds.length && this.deleteFeature(deleteVertexIds, { silent: true });
  // 清除选中要素的队列
  this.clearSelectedFeatures();
};

export default SelectMode;
