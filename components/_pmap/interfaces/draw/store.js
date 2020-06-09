/**
 * @文件说明: 定义Draw绘图的数据存储管理
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-26 17:09:58
 */

import deepmerge from 'deepmerge';
import hat from 'hat';
import Constants from './constants';
import toDenseArray from './libs/to_dense_array';
import StringSet from './libs/string_set';
import Point from './feature_types/point';
import LineString from './feature_types/line_string';
import Polygon from './feature_types/polygon';
import MultiFeature from './feature_types/multi_feature';
import { getDrawLayers, defaultDrawTheme } from './styles';
import render from './render';
import { isBooleanTrue } from '../../../_util/methods-util';

class Store {
  constructor(ctx) {
    this.ctx = ctx;
    this.iMapApi = ctx.api.iMapApi;

    // 绘制的Feature要素对象
    this._features = {};
    // 绘制的Feature要素Id集合
    this._featureIds = new StringSet();
    this._selectedFeatureIds = new StringSet();
    this._selectedCoordinates = [];
    // 绘制时待更新的Feature要素Id集合
    this._changedFeatureIds = new StringSet();
    this._deletedFeaturesToEmit = [];
    this._emitSelectionChange = false;

    this.sources = [];
    // 处理绘图的默认数据集
    const featureCollection = this.iMapApi.getFeatureCollection(ctx.options.data);
    if (featureCollection && featureCollection.features.length) {
      featureCollection.features.map(f => {
        !f.id && (f.id = hat());
        const feature = this.getFeatureToGeoJSON(f);
        this._features[f.id] = feature;
        this._featureIds.add(feature.id);
        this.sources.push(feature.toGeoJSON());
      });
    }
    // 合并图层主题样式
    this.theme = deepmerge(defaultDrawTheme, ctx.options.theme);
    // 判断是否渲染加载绘图图层组
    this._isLoadedLayers = false;
    // 图层数据渲染临时绘制数据
    let renderRequest;
    this.render = () => {
      if (!renderRequest) {
        renderRequest = requestAnimationFrame(() => {
          renderRequest = null;
          render.call(this);
        });
      }
    };
    // 判断是否为模式切换时渲染状态
    this.isModeChangeRender = false;
  }

  // 判断是否渲染加载矢量图层组
  isLoadedLayers() {
    return this._isLoadedLayers;
  }

  // 添加绘图的矢量图层组
  addLayers() {
    if (this._isLoadedLayers) {
      return;
    }

    const sourceId = `${Constants.sources.ID}.${this.ctx.uid}`;
    const layerGroupId = `draw-layers-group.${this.ctx.uid}`;
    // 添加图层的所属数据源
    this.iMapApi.addSource(sourceId, {
      type: 'geojson',
      data: this.iMapApi.getFeatureCollection(this.sources),
    });
    // 获取绘图的图层结构
    const layers = getDrawLayers(this.theme);
    // 添加图层到绘图图层组中
    layers &&
      layers.map(layer => {
        const id = `${layer.id}.${this.ctx.uid}`;
        layer.options.source = sourceId;
        switch (layer.type) {
          case 'point': {
            this.iMapApi.Layers.addCirclePointLayer(id, layer.options, { layerGroupId });
            break;
          }
          case 'line': {
            this.iMapApi.Layers.addLineLayer(id, layer.options, { layerGroupId });
            break;
          }
          case 'polygon': {
            this.iMapApi.Layers.addPolygonLayer(id, layer.options, { layerGroupId });
            break;
          }
        }
      });
    // 更新状态
    this._isLoadedLayers = true;
  }

  // 移除绘图的矢量图层组
  removeLayers() {
    if (!this._isLoadedLayers) {
      return;
    }
    // 移除绘图图层组
    this.iMapApi.removeLayer(`draw-layers-group.${this.ctx.uid}`);
    // 更新状态
    this._isLoadedLayers = false;
  }

  // 设置绘图模式切换时渲染状态
  setModeChangeRendering() {
    this.isModeChangeRender = true;
    return this;
  }

  // 转换Feature要素为内置绘图的对象
  getFeatureToGeoJSON(geojson) {
    let feature = null;
    switch (geojson.geometry.type) {
      case Constants.geojsonTypes.POINT:
        feature = new Point(this.ctx, geojson);
        break;
      case Constants.geojsonTypes.LINE_STRING:
        feature = new LineString(this.ctx, geojson);
        break;
      case Constants.geojsonTypes.POLYGON:
        feature = new Polygon(this.ctx, geojson);
        break;
      case Constants.geojsonTypes.MULTI_POINT:
      case Constants.geojsonTypes.MULTI_LINE_STRING:
      case Constants.geojsonTypes.MULTI_POLYGON:
        feature = new MultiFeature(this.ctx, geojson);
        break;
    }

    if (feature) {
      const mode = this.ctx.events.currentModeName() || this.ctx.options.defaultMode;
      return feature.internal(mode);
    }
    return feature;
  }

  // 获取指定Id的Feature要素对象
  get(id) {
    return this._features[id];
  }

  // 获取所有的已渲染的Feature要素Ids
  getAllIds() {
    return this._featureIds.values();
  }

  // 获取所有的渲染Feature要素
  getAll() {
    return Object.keys(this._features).map(id => this._features[id]);
  }

  // 获取所有待更新的Feature要素Ids
  getChangedIds() {
    return this._changedFeatureIds.values();
  }

  // 清空更新绘图的Feature要素Id记录器
  clearChangedIds() {
    this._changedFeatureIds.clear();
    return this;
  }

  // 设置指定的Feature要素Id添加到更新状态
  featureChanged(featureId) {
    this._changedFeatureIds.add(featureId);
    return this;
  }

  // 获取所有选中Feature要素的Id集合
  getSelectedIds() {
    return this._selectedFeatureIds.values();
  }

  // 获取所有选中的Feature要素集合
  getSelected() {
    return this._selectedFeatureIds.values().map(id => this.get(id));
  }

  // 清除当前选中的要素
  clearSelected(options = {}) {
    this.deselect(this._selectedFeatureIds.values(), { silent: options.silent });
    return this;
  }

  // 选中指定的Feature要素
  select(featureIds, options = {}) {
    toDenseArray(featureIds).map(id => {
      if (this._selectedFeatureIds.has(id)) return;
      this._selectedFeatureIds.add(id);
      this._changedFeatureIds.add(id);
      if (!options.silent) {
        this._emitSelectionChange = true;
      }
    });
    return this;
  }

  // 删除当前选中指定Id的Feature要素
  deselect(featureIds, options = {}) {
    toDenseArray(featureIds).map(id => {
      if (!this._selectedFeatureIds.has(id)) {
        return;
      }
      this._selectedFeatureIds.delete(id);
      this._changedFeatureIds.add(id);
      if (!options || !isBooleanTrue(options.silent)) {
        this._emitSelectionChange = true;
      }
    });
    this.refreshSelectedCoordinates(options);
    return this;
  }

  // 设置指定的Id的要素选中
  setSelected(featureIds, options = {}) {
    featureIds = toDenseArray(featureIds);
    // 将指定Id要素数据之外的选中要素进行移除
    this.deselect(
      this._selectedFeatureIds.values().filter(id => featureIds.indexOf(id) === -1),
      { silent: options.silent },
    );
    // 选中指定Id的要素
    this.select(
      featureIds.filter(id => !this._selectedFeatureIds.has(id)),
      { silent: options.silent },
    );
    return this;
  }

  // 判断指定Id的要素是否选中
  isSelected(featureId) {
    return this._selectedFeatureIds.has(featureId);
  }

  // 刷新选中Feature要素的节点坐标
  refreshSelectedCoordinates(options = {}) {
    const newSelectedCoordinates = this._selectedCoordinates.filter(point => this._selectedFeatureIds.has(point.feature_id));
    if (this._selectedCoordinates.length !== newSelectedCoordinates.length && (!options || !isBooleanTrue(options.silent))) {
      this._emitSelectionChange = true;
    }
    this._selectedCoordinates = newSelectedCoordinates;
  }

  // 获取选中Feature要素的节点坐标
  getSelectedCoordinates() {
    const selected = this._selectedCoordinates.map(coordinate => {
      const feature = this.get(coordinate.feature_id);
      return {
        coordinates: feature.getCoordinate(coordinate.coord_path),
        path: coordinate.coord_path,
        pid: coordinate.feature_id,
      };
    });
    return selected;
  }

  // 设置选中的Feature要素节点
  setSelectedCoordinates(coordinates) {
    this._selectedCoordinates = coordinates;
    this._emitSelectionChange = true;
    return this;
  }

  // 清空选中的Feauture要素节点
  clearSelectedCoordinates() {
    this._selectedCoordinates = [];
    this._emitSelectionChange = true;
    return this;
  }

  // 添加绘制Feature要素
  add(feature) {
    this._features[feature.id] = feature;
    this._featureIds.add(feature.id);
    this.featureChanged(feature.id);
    return this;
  }

  // 删除绘制的Feature要素
  delete(featureIds, options = {}) {
    toDenseArray(featureIds).map(id => {
      if (!this._featureIds.has(id)) return;
      this._featureIds.delete(id);
      this._selectedFeatureIds.delete(id);
      // 将Meta为Feature要素的数据加入待删除的队列
      if (this._deletedFeaturesToEmit.indexOf(this._features[id]) === -1 && this._features[id].properties['draw:meta'] === Constants.meta.FEATURE) {
        !options.silent && this._deletedFeaturesToEmit.push(this._features[id]);
      }
      delete this._features[id];
    });
    this.refreshSelectedCoordinates(options);
    return this;
  }

  // 设置Feature的外置属性
  setFeatureProperty(featureId, property, value) {
    this.get(featureId).setProperty(property, value);
    this.featureChanged(featureId);
  }

  // 创建延迟渲染函数
  createRenderBatch() {
    const holdRender = this.render;
    let numRenders = 0;
    this.render = function() {
      numRenders++;
    };

    return () => {
      this.render = holdRender;
      if (numRenders > 0) {
        this.render();
      }
    };
  }
}

export default Store;
