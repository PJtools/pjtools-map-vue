/**
 * @文件说明:
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-26 17:24:30
 */

import Constants from './constants';
import { isNotEmptyArray, isEmpty } from '../../../_util/methods-util';
import find from 'lodash/find';

export default function render() {
  const store = this;
  const ctx = this.ctx;
  const iMapApi = this.iMapApi;

  // 判断绘制图层数据源是否不存在，则直接忽略
  const drawSource = iMapApi.getSource(`${Constants.sources.ID}.${this.ctx.uid}`);
  if (!drawSource) {
    return cleanup();
  }

  const mode = ctx.events.currentModeName();
  // 清除记录
  const cleanup = () => {
    store.isModeChangeRender = false;
    store.clearChangedIds();
  };
  // 渲染Feature要素
  const renderFeature = id => {
    let feature = store.get(id);
    feature = feature.updateInternalProperty('mode', mode);
    feature = feature.toGeoJSON();
    let currentFeature = null;
    ctx.events.currentModeRender(feature, geojson => {
      currentFeature = geojson;
    });
    return currentFeature;
  };

  const featureIds = store.getAllIds();
  const changedIds = store.getChangedIds().filter(id => {
    const feature = store.get(id);
    return feature !== null && feature !== undefined;
  });
  const selectedIds = store.getSelectedIds().filter(id => {
    const feature = store.get(id);
    return feature !== null && feature !== undefined;
  });
  console.warn(mode, store.isModeChangeRender);
  console.warn('更新队列', changedIds);
  console.warn('选中队列', selectedIds);

  const newSources = [];
  const renderList = [];
  // 遍历绘图的Feature要素集合，对需更新的Feature要素进行重渲染
  isNotEmptyArray(featureIds) &&
    featureIds.map(id => {
      let feature = null;
      // 判断是否为模式切换刷新渲染 | 是否在更新状态列表中 | 是否在选中状态列表中
      if (store.isModeChangeRender || changedIds.indexOf(id) !== -1 || selectedIds.indexOf(id) !== -1) {
        feature = renderFeature(id);
        renderList.push(feature);
      } else {
        feature = find(store.sources, { id });
      }
      feature && newSources.push(feature);
    });
  console.warn('全数据源：', newSources);
  console.warn('更新数据：', renderList);

  // 判断是否执行有要素的选中状态变化
  if (store._emitSelectionChange) {
    ctx.api.fire(Constants.events.SELECTION_CHANGE, {
      mode,
      features: store.getSelected().map(feature => feature.toGeoJSON()),
      // points: store.getSelectedCoordinates().map(coordinate => ({
      //   type: Constants.geojsonTypes.FEATURE,
      //   properties: {},
      //   geometry: {
      //     type: Constants.geojsonTypes.POINT,
      //     coordinates: coordinate.coordinates,
      //   },
      // })),
    });

    store._emitSelectionChange = false;
  }

  // 判断是否有待删除的Feature要素
  if (store._deletedFeaturesToEmit && store._deletedFeaturesToEmit.length) {
    const emitFeatures = [];
    const emitFeatureIds = [];
    store._deletedFeaturesToEmit.map(feature => {
      emitFeatureIds.push(feature.id);
      emitFeatures.push(feature.toGeoJSON());
    });
    // 移除数据源的删除Feature要素
    store.sources = store.sources.filter(feature => emitFeatureIds.indexOf(feature.id) === -1);
    store._deletedFeaturesToEmit = [];
    // 绘制要素删除时执行回调事件
    ctx.api.fire(Constants.events.DELETE, { mode, features: emitFeatures });
  }

  // 判断是否有绘图数据源更新，则重新渲染图层数据
  if (!!(renderList && renderList.length)) {
    store.sources = newSources;
    // 设置绘图的数据源数据
    drawSource.setData({
      type: Constants.geojsonTypes.FEATURE_COLLECTION,
      features: store.sources,
    });
    // 绘制要素数据时执行回调事件
    ctx.api.fire(Constants.events.RENDER, { mode });
  }

  // 清理待更新队列缓存
  cleanup();
}
